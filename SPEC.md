# SPEC — whaticket-fibernet

## Caso de uso
All · idioma pt-BR · volume low

## Canais habilitados
Evolution API (Já instalado na sua VPS)

## Stack
- Next.js 16 (App Router, standalone build)
- shadcn/ui "nova" · base zinc · radius 0.375rem · accent #adff2f (Alien Green)
- Geist + Geist Mono
- postgres_docker (Prisma)
- redis_docker p/ debounce + rate-limit
- Auth: magic_link
- Containers provisionados conforme canais:
  - sempre: `app` (Next.js) + Postgres + Redis
  - `evolution` (Já instalado via sistema/container externo)

## LLM
- Principal: groq (llama-3.1-70b-versatile)
- Fallback: provider
- Memória: window_20

## Debounce de mensagens
Ativo: true
Janela: 5000ms
Buffer máximo: 20 msgs por contato
Store: Redis (chave `debounce:<channel>:<contact>`)

## Tools habilitadas
Calendário (Google Cal/Cal.com), Web search (Tavily), Knowledge base / RAG, Webhook custom

## Handoff
Trigger: explicit · Destino: Mesmo canal — outro número/conta (Recommended)

## Horário
24/7 (America/Sao_Paulo)

## ⚠️ Avisos
- A infraestrutura será baseada em Docker Compose para facilitar o deploy na sua VPS.
- Certifique-se de que a porta da Evolution API está acessível para o container do Next.js.

## Critérios de aceite (§8 valida)
1. Cada canal em `channels.enabled` conecta em <5 min pelo onboarding
2. Enviar 3 msgs em sequência (intervalo <5s) no mesmo contato → receber **1** resposta coalesced em ~5000ms + LLM latency
3. Alternar modelo no painel → próxima msg usa o novo modelo
4. Ativar tool "calendário" → mensagem "o que tenho hoje?" retorna eventos
5. Todos os serviços (app, postgres, redis) healthy na VPS
6. Redis `PING` retorna `PONG`
