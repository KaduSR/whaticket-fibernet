#!/bin/bash

# deploy.sh - Script de Deploy Automatizado via GitHub para Whaticket Fibernet
# Desenvolvido para rodar em VPS (Ubuntu/Debian)

set -e

# --- CONFIGURAÇÃO ---
# Substitua pela URL do SEU repositório
REPO_URL="https://github.com/SEU_USUARIO/whaticket-fibernet.git"
PROJECT_DIR="whaticket-fibernet"
# -------------------

echo "🚀 Iniciando Deploy do Whaticket Fibernet via GitHub..."

# 1. Verificar/Instalar Docker e Git
if ! command -v git &> /dev/null; then
    echo "📦 Instalando Git..."
    apt-get update && apt-get install -y git
fi

if ! command -v docker &> /dev/null; then
    echo "📦 Docker não encontrado. Instalando..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
else
    echo "✅ Docker já instalado."
fi

if ! command -v docker-compose &> /dev/null; then
    echo "📦 Docker Compose não encontrado. Instalando..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
else
    echo "✅ Docker Compose já instalado."
fi

# 2. Clonar ou Atualizar Repositório
if [ -d "$PROJECT_DIR" ]; then
    echo "📂 Repositório já existe. Atualizando via git pull..."
    cd "$PROJECT_DIR"
    git pull
else
    echo "📥 Clonando repositório do GitHub..."
    git clone "$REPO_URL" "$PROJECT_DIR"
    cd "$PROJECT_DIR"
fi

# 3. Configurar Variáveis de Ambiente
echo "⚙️ Configurando variáveis de ambiente..."
if [ ! -f ".env" ]; then
    echo "Criando arquivo .env..."
    cat <<EOF > .env
DATABASE_URL="postgresql://user:password@postgres:5432/whaticket"
REDIS_URL="redis://redis:6379"
NEXT_PUBLIC_APP_URL="http://$(curl -s ifconfig.me)"
NODE_ENV="production"
EOF
fi

# 4. Subir Infraestrutura (Postgres, Redis)
echo "🐳 Subindo containers de infraestrutura..."
docker-compose up -d postgres redis

# 5. Rodar Migrações do Prisma
echo "🗄️ Executando migrações do banco de dados..."
docker-compose run --rm app npx prisma migrate deploy

# 6. Build e Start do App Next.js
echo "🏗️ Fazendo build e iniciando o App..."
docker-compose up -d --build app

echo "-------------------------------------------------------"
echo "✅ DEPLOY VIA GITHUB CONCLUÍDO!"
echo "🌐 Acesse seu painel em: http://$(curl -s ifconfig.me)"
echo "-------------------------------------------------------"
