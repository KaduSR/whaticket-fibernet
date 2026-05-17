'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function ERPSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({ url: '', token: '' });

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch('/api/settings/erp');
        const data = await res.json();
        setConfig({
          url: data.url || '',
          token: data.token || '',
        });
      } catch (error) {
        toast.error('Erro ao carregar configurações do ERP');
      }
    }
    loadConfig();
  }, []);

  async function handleSave() {
    setLoading(true);
    try {
      const res = await fetch('/api/settings/erp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error('Erro ao salvar');
      toast.success('Configurações do ERP salvas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <Card className="border-zinc-800 bg-zinc-950 text-zinc-100">
        <CardHeader>
          <CardTitle className="text-lime-400">Integração ERP IXC</CardTitle>
          <CardDescription className="text-zinc-400">
            Configure a conexão com seu ERP para que o agente possa consultar dados de clientes e faturas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url" className="text-zinc-300">URL da API</Label>
            <Input
              id="url"
              placeholder="https://seu-erp.ixcsoft.com.br/webservice/v1"
              value={config.url}
              onChange={(e) => setConfig({ ...config, url: e.target.value })}
              className="bg-zinc-900 border-zinc-700 text-zinc-100 focus:ring-lime-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="token" className="text-zinc-300">Token de Autenticação</Label>
            <Input
              id="token"
              type="password"
              placeholder="Insira seu token"
              value={config.token}
              onChange={(e) => setConfig({ ...config, token: e.target.value })}
              className="bg-zinc-900 border-zinc-700 text-zinc-100 focus:ring-lime-500"
            />
          </div>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-lime-500 hover:bg-lime-600 text-zinc-950 font-bold transition-colors"
          >
            {loading ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
