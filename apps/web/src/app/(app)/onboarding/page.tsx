'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

// Sub-components for each step (we will implement these next)
import ChannelStep from './steps/ChannelStep';
import ModelStep from './steps/ModelStep';
import PromptStep from './steps/PromptStep';
import ToolsStep from './steps/ToolsStep';
import ConfigStep from './steps/ConfigStep';

const STEPS = [
  { id: 'channels', title: 'Canais' },
  { id: 'model', title: 'IA' },
  { id: 'prompt', title: 'Prompt' },
  { id: 'tools', title: 'Tools' },
  { id: 'config', title: 'Finalizar' },
];

export default function OnboardingPage() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [config, setConfig] = useState<any>({});

  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

  const handleNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const renderStep = () => {
    const stepId = STEPS[currentStepIndex].id;
    switch (stepId) {
      case 'channels':
        return <ChannelStep config={config} setConfig={setConfig} />;
      case 'model':
        return <ModelStep config={config} setConfig={setConfig} />;
      case 'prompt':
        return <PromptStep config={config} setConfig={setConfig} />;
      case 'tools':
        return <ToolsStep config={config} setConfig={setConfig} />;
      case 'config':
        return <ConfigStep config={config} setConfig={setConfig} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center p-4 md:p-10">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header & Progress */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-lime-400">Bem-vindo ao Whaticket Fibernet</h1>
          <p className="text-zinc-400">Vamos configurar seu agente de atendimento inteligente em poucos passos.</p>
          <div className="pt-4">
            <Progress value={progress} className="h-2 bg-zinc-800" />
            <div className="flex justify-between mt-2 text-xs text-zinc-500 uppercase tracking-widest">
              {STEPS.map((s, i) => (
                <span key={s.id} className={i <= currentStepIndex ? 'text-lime-500 font-bold' : ''}>
                  {s.title}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Step Content */}
        <main className="min-h-[400px]">
          {renderStep()}
        </main>

        {/* Navigation */}
        <footer className="flex justify-between items-center pt-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStepIndex === 0}
            className="text-zinc-400 hover:text-zinc-100"
          >
            <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
          </Button>

          {currentStepIndex === STEPS.length - 1 ? (
            <Button
              onClick={() => alert('Finalizando configuração...')}
              className="bg-lime-500 hover:bg-lime-600 text-zinc-950 font-bold px-8"
            >
              Concluir Setup
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="bg-zinc-100 hover:bg-white text-zinc-950 font-bold px-8"
            >
              Próximo <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </footer>
      </div>
    </div>
  );
}
