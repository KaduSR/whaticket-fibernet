# 🚀 Whaticket Fibernet

**Whaticket Fibernet** é uma plataforma SaaS de atendimento inteligente via WhatsApp, projetada para oferecer uma experiência de atendimento automatizada, fluida e altamente integrada com sistemas de gestão (ERP).

Diferente de soluções tradicionas, o Whaticket Fibernet utiliza um **Orquestrador de IA** para gerenciar conversas, permitำendo a criação de fluxos de atendimento dinâmicos através de um **Flow Builder** visual.

---

## ✨ Principais Funcionalidades

- **🤖 Agente de IA Inteligente:** Integração nativa com LLMs (Groq, Anthropic, OpenAI, Google Gemini) para responder mensagens de forma natural e contextual.
- **🎨 Flow Builder (Designer de Fluxos):** Interface de chat para criar fluxos de atendimento complexos (ex: "Saudação" $\rightarrow$ "Verificar Saldo no IXC" $\rightarrow$ "Transferir para Humano") sem escrever uma linha de código.
- **🔌 Integração com ERP IXC:** Consulta automática de dados de clientes, faturas e status diretamente no seu ERP através de integração via API.
- **📱 Multi-canal:** Suporte para **Evolution API** (WhatsApp), Waha, WhatsApp Cloud API e Instagram Direct.
- **⚡ Debounce de Mensagens:** Tecnologia de *sliding window* via Redis para evitar que a IA responda a cada fragmento de mensagem, garantindo uma experiência de conversa natural.
- **📊 Painel de Gestão:** Dashboard completo para monitorar conversas, custos de tokens, métricas de atendimento e configurações de agentes.

---

## 🛠️ Stack Tecnológica

O projeto utiliza as tecnologias mais modernas e performáticas do mercado:

- **Frontend:** [Next.js 16](https://nextjs.org/) (App Router) com [TypeScript](https://www.typescriptlang.org/).
- **UI/UX:** [shadcn/ui](https://ui.shadcn.com/) (baseado em Tailwind CSS) com tema *Alien Green*.
- **Backend:** [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers) (Serverless/Standalone).
- **Banco de Dados:** [PostgreSQL](https://www.postgresql.org/) com [Prisma ORM](https://www.prisma.io/).
- **Cache & Debounce:** [Redis](https://redis.io/).
- **Orquestração de Containers:** [Docker](https://www.docker.com/) & Docker Compose.
- **Comunicação WhatsApp:** [Evolution API](https://evolution-api.com/).

---

## 🚀 Deploy na VPS (Instalação Rápida)

Preparamos um script de automação para que você possa subir o projeto completo na sua VPS em minutos.

### 1. Preparação
Certifique-se de que sua VPS possui **Docker** e **Docker Compose** instalados.

### 2. Clonar e Executar
Conecte-se à sua VPS via SSH e execute os seguintes comandos:

```bash
# 1. Clone o repositório
git clone https://github.com/KaduSR/whaticket-fibernet.git
cd whaticket-fibernet

# 2. Dê permissão ao script de deploy
chmod +x deploy.sh

# 3. Execute o deploy
./deploy.sh
```

O script irá automaticamente:
- Configurar os containers de Banco de Dados e Cache.
- Criar as tabelas no banco via Prisma.
- Realizar o Build do App Next.js.
- Subir o serviço de produção.

---

## ⚙️ Configuração de Integrações

### IXC ERP
Para integrar o seu ERP, acesse o painel administrativo em:
`Configurações > Integrações > ERP IXC` e insira a **URL da API** e o seu **Token de Autenticação**.

### Agentes de IA
No painel, você pode criar diferentes "Personas" (ex: SDR, Suporte, Vendas), definindo para cada uma:
- O Modelo de IA (ex: Llama 3 via Groq).
- O System Prompt (instruções de comportamento).
- As ferramentas (Tools) que o agente pode usar (Calendário, Busca na Web, RAG).

---

## 📄 Licença

Este projeto é para uso privado e comercial conforme as necessidades do desenvolvedor.
