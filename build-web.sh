#!/bin/bash

echo "🚀 Compilando aplicación Angular solercia-web..."

# Navegar al directorio del proyecto Angular
cd /srv/apps/solercia_flows/solercia-web

# Verificar si existe node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

# Compilar para producción
echo "🔨 Compilando para producción..."
npm run build

# Verificar que se generaron los archivos
if [ -d "dist/solercia-web/browser" ]; then
    echo "✅ Compilación exitosa!"
    echo "📁 Archivos generados en: dist/solercia-web/browser/"
    ls -la dist/solercia-web/browser/

    echo ""
    echo "🐳 Ahora puedes reiniciar el servicio Docker:"
    echo "   docker compose restart solercia-web"
    echo "   o"
    echo "   docker compose up -d solercia-web"
else
    echo "❌ Error en la compilación"
    exit 1
fi
