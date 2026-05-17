import { prisma } from '@/lib/db';
import { ChannelMessage } from '@/lib/channels/types';
import { decideAction } from '@/lib/ai-rules/evaluate';
import { getIXCClient } from '@/lib/ixc/client';
import { getEnabledAdapters } from '@/lib/channels/registry';

export async function flushToLLM(messages: ChannelMessage[]) {
  const firstMsg = messages[0];
  const { contactId, channel } = firstMsg;

  // 1. Find or create conversation
  let conversation = await prisma.conversation.findFirst({
    where: { contactId: contactId, channel: channel },
    include: { agentSession: true },
  });

  if (!conversation) {
    // In a real app, you'd find the contact first.
    // For MVP, we assume contact exists or create a minimal one.
    return;
  }

  // 2. Evaluate Rules
  const decision = await decideAction(messages, conversation);

  if (decision.action === 'drop') {
    console.log(`[Orchestrator] Dropping message: ${decision.reason}`);
    return;
  }

  if (decision.action === 'handoff') {
    console.log(`[Orchestrator] Handoff triggered: ${decision.reason}`);
    // Trigger notification/handoff logic
    return;
  }

  if (decision.action === 'static_reply') {
    const adapter = getEnabledAdapters()[channel as any];
    if (adapter) await adapter.sendText(contactId, decision.text);
    return;
  }

  // 3. Prepare LLM Call (for 'respond')
  if (decision.action === 'respond') {
    const session = conversation.agentSession;
    if (!session) return;

    const adapter = getEnabledAdapters()[channel as any];
    if (!adapter) return;

    // Combine messages for the LLM
    const prompt = messages.map(m => `${m.role}: ${m.text}`).join('\n');
    const systemPrompt = session.systemPrompt;

    try {
      // SIMULATION: Call LLM (e.g., Groq/Claude)
      // In real life: const response = await llm.chat({ systemPrompt, messages });
      const aiResponse = `[AI Response to: "${messages[messages.length-1].text}"]`;

      // 4. Check for Flow Execution
      // If conversation is in a flow, we'd check the current step here.

      // 5. Send response
      await adapter.sendText(contactId, aiResponse);

      // 6. Persist Message
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          direction: 'outbound',
          role: 'assistant',
          text: aiResponse,
        },
      });

    } catch (error) {
      console.error('[Orchestrator] LLM error:', error);
    }
  }
}
