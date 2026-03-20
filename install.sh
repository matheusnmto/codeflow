#!/bin/bash

echo "→ Instalando codeflow..."

# Verifica Node.js
if ! command -v node &> /dev/null; then
  echo "✗ Node.js não encontrado. Instale em https://nodejs.org"
  exit 1
fi

# Verifica versão mínima do Node (18+)
NODE_VERSION=$(node -e "process.stdout.write(process.versions.node.split('.')[0])")
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "✗ Node.js 18+ necessário. Versão atual: $NODE_VERSION"
  exit 1
fi

# Instala dependências
npm install --silent

# Registra o comando globalmente
npm link

echo "✓ codeflow instalado com sucesso!"
echo ""
echo "  Uso: codeflow ./seu-projeto"
echo ""

# Verifica dependências opcionais
if command -v python3 &> /dev/null; then
  echo "  ✓ python3 detectado — suporte a Python, C/C++, Java ativo"
else
  echo "  ⚠ python3 não encontrado — suporte a Python, C/C++, Java desativado"
fi

if command -v go &> /dev/null; then
  echo "  ✓ go detectado — suporte a Go ativo" 
else
  echo "  ⚠ go não encontrado — suporte a Go desativado"
fi
