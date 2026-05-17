'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Plus, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'assistant' | 'user' | 'system';
  content: string;
}

interface FlowStep {
  id: string;
  order: number;
  type: 'prompt' | 'tool_call' | 'condition' | 'handoff';
  content: string;
}

export default function FlowBuilderChat({ agentSessionId }: { agentSessionId: string }) {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Olá! Eu sou seu assistente de construção de fluxos. Vamos desenhar o atendimento do seu cliente. Primeiro, qual o objetivo principal deste fluxo?' }
  ]);
  const [input, setInput] = useState('');
  const [steps, setSteps] = useState<FlowStep[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSendMessage() {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsGenerating(true);

    try {
      // Simulation of LLM building a flow step based on chat
      // In real implementation: POST /api/flow/suggest-step
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newStep: FlowStep = {
        id: Math.random().toString(36).substr(2, 9),
        order: steps.length,
        type: 'prompt',
        content: input,
      };

      setSteps(prev => [...prev, newStep]);

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Entendido! Adicionei um passo de "${input}". O que deve acontecer depois disso? (ex: "Verificar saldo no IXC", "Transferir para humano")`
      };
      setMessages(prev => [...prev, assistantMsg]);

    } catch (error) {
      toast.error('Erro ao processar fluxo');
    } finally {
      setIsGenerating(false);
    }
  }

  const saveFlow = async () => {
    setIsGenerating(true);
    try {
      // POST /api/flows
      toast.success('Fluxo salvo com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar fluxo');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-120px)] gap-6 p-6">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
        <CardHeader className="border-b border-zinc-800 bg-zinc-900/50">
          <CardTitle className="text-lime-400 flex items-center gap-2">
            <Bot className="w-5 h-5" /> Designer de Fluxo AI
          </CardTitle>
        </CardHeader>

        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl flex gap-3 ${
                  msg.role === 'user'
                    ? 'bg-lime-500 text-zinc-950 rounded-tr-none'
                    : 'bg-zinc-900 text-zinc-100 rounded-tl-none border border-zinc-800'
                }`}>
                  {msg.role === 'assistant' && <Bot className="w-5 h-5 shrink-0 mt-1" />}
                  {msg.role === 'user' && <User className="w-5 h-5 shrink-0 mt-1" />}
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            {isGenerating && (
              <div className="flex justify-start">
                <div className="bg-zinc-900 p-3 rounded-2xl animate-pulse text-zinc-500 text-xs">
                  AI desenhando o fluxo...
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-zinc-800 bg-zinc-900/30">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Descreva o próximo passo do atendimento..."
              className="bg-zinc-900 border-zinc-700 text-zinc-100"
            />
            <Button onClick={handleSendMessage} disabled={isGenerating} className="bg-lime-500 hover:bg-lime-600 text-zinc-950">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Steps Preview Area */}
      <div className="w-1/3 flex flex-col gap-4">
        <Card className="flex-1 bg-zinc-950 border-zinc-800 overflow-hidden flex flex-col">
          <CardHeader className="border-b border-zinc-800">
            <CardTitle className="text-sm font-medium text-zinc-400 flex justify-between items-center">
              Estrutura do Fluxo
              <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded-full">{steps.length} passos</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4">
            {steps.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-600 text-center space-y-2">
                <Plus className="w-8 h-8 opacity-20" />
                <p className="text-xs">O chat criará os passos automaticamente para você.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <div key={step.id} className="group relative flex items-start gap-3 p-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-lime-500/50 transition-colors">
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400">
                        {index + 1}
                      </div>
                      {index !== steps.length - 1 && <div className="w-px h-full bg-zinc-800 my-1" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{step.type}</p>
                      <p className="text-sm text-zinc-200 truncate">{step.content}</p>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 transition-opacity">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <div className="p-4 border-t border-zinc-800">
            <Button onClick={saveFlow} className="w-full bg-zinc-100 hover:bg-white text-zinc-950 flex gap-2">
              <Save className="w-4 h-4" /> Salvar Fluxo
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
