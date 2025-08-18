#!/bin/bash
echo "🎨 Aplicando branding de Solercia a N8N..."

# Esperar que N8N esté listo
sleep 10

# CSS con colores de Solercia (basado en tu logo)
SOLERCIA_CSS='<style id="solercia-theme">
:root {
  --solercia-gradient: linear-gradient(135deg, #00FFA3 0%, #00D4FF 100%);
  --solercia-primary: #00D4FF;
  --solercia-secondary: #00FFA3;
  --solercia-primary-dark: #00B8E6;
}

/* Reemplazar colores naranjas de N8N */
.n8n-theme-dark, .n8n-theme-light {
  --color-primary: var(--solercia-primary) !important;
  --color-primary-tint-1: #33DDFF !important;
  --color-primary-shade-1: var(--solercia-primary-dark) !important;
  --color-secondary: var(--solercia-secondary) !important;
}

/* Botones principales */
.el-button--primary, .n8n-button--primary, .el-button.el-button--primary {
  background: var(--solercia-gradient) !important;
  border: none !important;
  color: white !important;
  font-weight: 600 !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 4px 15px rgba(0, 212, 255, 0.25) !important;
}

.el-button--primary:hover, .n8n-button--primary:hover {
  background: linear-gradient(135deg, #00E696 0%, #00BFFF 100%) !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 20px rgba(0, 212, 255, 0.4) !important;
}

/* Elementos activos */
.el-menu-item.is-active {
  background: linear-gradient(90deg, rgba(0, 255, 163, 0.1) 0%, rgba(0, 212, 255, 0.1) 100%) !important;
  border-right: 3px solid var(--solercia-primary) !important;
  color: var(--solercia-primary) !important;
}

.el-tabs__active-bar {
  background: var(--solercia-gradient) !important;
  height: 3px !important;
}

/* Switch/Toggle */
.el-switch.is-checked .el-switch__core {
  background: var(--solercia-primary) !important;
}

/* Progress bars */
.el-progress-bar__inner {
  background: var(--solercia-gradient) !important;
}

/* Radio buttons */
.el-radio__input.is-checked .el-radio__inner {
  background: var(--solercia-primary) !important;
  border-color: var(--solercia-primary) !important;
}

/* Checkboxes */
.el-checkbox__input.is-checked .el-checkbox__inner {
  background: var(--solercia-primary) !important;
  border-color: var(--solercia-primary) !important;
}

/* Links */
a, .n8n-link {
  color: var(--solercia-primary) !important;
}

/* Loading spinner */
.el-loading-spinner .circular, .el-loading-spinner .path {
  stroke: var(--solercia-primary) !important;
}

/* Input focus */
.el-input__inner:focus, .el-textarea__inner:focus {
  border-color: var(--solercia-primary) !important;
  box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.2) !important;
}

/* Workflow nodes */
.node-default.node-box.node-box-selected {
  border-color: var(--solercia-primary) !important;
  box-shadow: 0 0 15px rgba(0, 212, 255, 0.3) !important;
}

/* Sidebar logo area */
.logo-container, .n8n-logo {
  background: var(--solercia-gradient) !important;
  background-clip: text !important;
  -webkit-background-clip: text !important;
  color: transparent !important;
}
</style>'

# Función para inyectar CSS
inject_css() {
    echo "💄 Inyectando CSS de Solercia..."
    find /usr/local/lib/node_modules/n8n/dist -name "*.html" -type f | while read -r file; do
        if [ -f "$file" ] && ! grep -q "solercia-theme" "$file"; then
            sed -i "s|</head>|$SOLERCIA_CSS</head>|" "$file" 2>/dev/null || true
        fi
    done
    echo "✅ CSS aplicado"
}

# Función para reemplazar textos
replace_text() {
    echo "🔤 Cambiando 'n8n' por 'Solercia Flows'..."

    # JavaScript files
    find /usr/local/lib/node_modules/n8n/dist -name "*.js" -type f -exec \
        sed -i 's/"n8n"/"Solercia Flows"/g; s/>n8n</>Solercia Flows</g; s/title="n8n"/title="Solercia Flows"/g' {} \; 2>/dev/null || true

    # HTML files
    find /usr/local/lib/node_modules/n8n/dist -name "*.html" -type f -exec \
        sed -i 's/<title>n8n<\/title>/<title>Solercia Flows<\/title>/g; s/>n8n</>Solercia Flows</g' {} \; 2>/dev/null || true

    echo "✅ Textos actualizados"
}

# Función para reemplazar favicon
replace_favicon() {
    echo "🖼️ Reemplazando favicon con logo de Solercia..."

    if [ -f "/n8n-custom/favicon.svg" ]; then
        # Reemplazar todos los favicons existentes
        find /usr/local/lib/node_modules/n8n/dist -name "favicon*" -type f | while read -r file; do
            cp "/n8n-custom/favicon.svg" "$file" 2>/dev/null || true
            echo "  → Reemplazado: $file"
        done

        # También crear copias en ubicaciones comunes
        cp "/n8n-custom/favicon.svg" "/usr/local/lib/node_modules/n8n/dist/favicon.ico" 2>/dev/null || true
        cp "/n8n-custom/favicon.svg" "/usr/local/lib/node_modules/n8n/dist/favicon.svg" 2>/dev/null || true

        # Actualizar referencias en HTML
        find /usr/local/lib/node_modules/n8n/dist -name "*.html" -type f -exec \
            sed -i 's|href="[^"]*favicon[^"]*"|href="/favicon.svg"|g' {} \; 2>/dev/null || true

        echo "✅ Favicon de Solercia aplicado"
    else
        echo "⚠️ No se encontró /n8n-custom/favicon.svg"
    fi
}

# Ejecutar personalizaciones
(
    sleep 15  # Esperar que N8N esté completamente iniciado
    inject_css
    replace_text
    replace_favicon
    echo "🎉 ¡Solercia Flows completamente personalizado!"
) &

echo "🚀 Iniciando Solercia Flows..."