import { prisma } from '@/lib/db';
import { ChannelMessage } from '@/lib/channels/types';
import { Conversation } from '@prisma/client';

export type Decision =
  | { action: 'respond'; agentSessionId: string }
  | { action: 'drop'; reason: string }
  | { action: 'handoff'; reason: string }
  | { action: 'static_reply'; text: string };

export async function decideAction(
  msgs: ChannelMessage[],
  conversation: Conversation
): Promise<Decision> {
  // 1. Human Override: if AI is disabled for this conversation, drop
  if (!conversation.aiEnabled) {
    return { action: 'drop', reason: 'AI disabled by operator' };
  }

  // 2. Identify Agent Session (from conversation or default)
  const session = conversation.agentSessionId
    ? await prisma.agentSession.findUnique({ where: { id: conversation.agentSessionId } })
    : await prisma.agentSession.findFirst({ where: { isDefault: true } });

  if (!session) {
    return { action: 'drop', reason: 'No agent session configured' };
  }

  // 3. Evaluate Rules (ordered by priority)
  const rules = await prisma.aIRule.findMany({
    where: { agentSessionId: session.id, enabled: true },
    orderBy: { priority: 'asc' },
  });

  for (const rule of rules) {
    const match = evaluateRule(rule, msgs, conversation);
    if (match) {
      if (rule.action === 'respond') return { action: 'respond', agentSessionId: session.id };
      if (rule.action === 'drop') return { action: 'drop', reason: `Rule ${rule.id}` };
      if (rule.action === 'handoff') return { action: 'handoff', reason: `Rule ${rule.id}` };
      if (rule.action === 'static_reply') return { action: 'static_reply', text: rule.staticReply || '' };
    }
  }

  // 4. Default: Respond
  return { action: 'respond', agentSessionId: session.id };
}

function evaluateRule(rule: any, msgs: ChannelMessage[], conv: Conversation): boolean {
  const lastMsg = msgs[msgs.length - 1].text.toLowerCase();

  switch (rule.mode) {
    case 'always_on': return true;
    case 'keyword_trigger':
      const keywords = rule.params.keywords as string[];
      return keywords.some(k => lastMsg.includes(k.toLowerCase()));
    case 'keyword_pause':
      const pauseKeywords = rule.params.keywords as string[];
      return pauseKeywords.some(k => lastMsg.includes(k.toLowerCase()));
    case 'schedule':
      // Basic check for current time vs rule.params.schedule
      return true; // Implementation for timezone/hours
    default: return false;
  }
}
