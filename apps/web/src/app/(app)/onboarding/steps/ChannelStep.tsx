'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { QrCode, CheckCircle2, RefreshCw } from 'lucide-react';

export default function ChannelStep({ config, setConfig }: { config: any, setConfig: (c: any) => void }) {
  const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SCAN_QR' | 'WORKING'>('IDLE');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [instanceName, setInstanceName] = useState(config.instanceName || 'default');

  async function connect() {
    setStatus('LOADING');
    try {
      // POST /api/sessions/evolution/ensure
      const res = await fetch('/api/sessions/evolution/ensure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instanceName }),
      });
      const data = await res.json();

      if (data.status === 'SCAN_QR') {
        setQrCode(data.qrCode);
        setStatus('SCAN_QR');
      } else if (data.status === 'WORKING') {
        setStatus('WORKING');
        toast.success('Conectado com sucesso!');
      } else {
        setStatus('IDLE');
        toast.error('Erro ao conectar');
      }
    } catch (error) {
      setStatus('IDLE');
      toast.error('Erro na requisição');
    }
  }

  async function checkStatus() {
    try {
      const res = await fetch('/api/sessions/evolution/status');
      const data = await res.json();
      if (data.status === 'WORKING') {
        setStatus('WORKING');
        setQrCode(null);
      }
    } catch (e) {}
  }

  // Poll for status if in SCAN_QR
  useEffect(() => {
    if (status === 'SCAN_QR') {
      const timer = setInterval(checkStatus, 3000);
      return () => clearInterval(timer);
    }
  }, [status]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="bg-zinc-950 border-zinc-800 text-zinc-100">
        <CardHeader>
          <CardTitle className="text-lime-400">Conexão WhatsApp (Evolution API)</CardTitle>
          <CardDescription className="text-zinc-400">
            Conecte sua instância da Evolution API para começar a receber mensagens.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-zinc-300">Nome da Instância</Label>
            <Input
              value={instanceName}
              onChange={(e) => setInstanceName(e.target.value)}
              placeholder="ex: default"
              className="bg-zinc-900 border-zinc-700 text-zinc-100"
            />
          </div>

          {status === 'IDLE' && (
            <Button onClick={connect} className="w-full bg-lime-500 hover:bg-lime-600 text-zinc-950 font-bold h-12 text-lg">
              Iniciar Conexão
            </Button>
          )}

          {status === 'LOADING' && (
            <div className="flex justify-center py-10">
              <RefreshCw className="w-8 h-8 animate-spin text-lime-500" />
            </div>
          )}

          {status === 'SCAN_QR' && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="bg-white p-4 rounded-xl">
                <img src={qrCode || ''} alt="QR Code" className="w-64 h-64" />
              </div>
              <p className="text-sm text-zinc-400 text-center">
                Abra o WhatsApp no seu celular <br />
                <span className="font-bold text-zinc-200">Aparelhos Conectados → Conectar um aparelho</span>
              </p>
              <Button variant="outline" onClick={connect} className="text-zinc-400 border-zinc-700">
                Atualizar QR Code
              </Button>
            </div>
          )}

          {status === 'WORKING' && (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
              <div className="bg-lime-500/10 p-4 rounded-full">
                <CheckCircle2 className="w-12 h-12 text-lime-500" />
              </div>
              <div>
                <p className="text-xl font-bold text-zinc-100">Tudo pronto!</p>
                <p className="text-sm text-zinc-400">Sua instância está conectada e ativa.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Helper for useEffect since I'm writing the file content directly
import { useEffect } from 'react';
