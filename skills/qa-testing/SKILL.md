---
name: qa-testing
description: >
  Quality gate y patrones de testing para BokiBot: smoke tests, Playwright e2e, validacion de flujos, quality checklist.
  Trigger: When writing tests, validating implementations, running smoke tests, or verifying quality of deliverables.
metadata:
  author: solercia
  version: "1.0"
---

## When to Use

Ejecutar este skill cuando:
- Se completa una feature o fix y se necesita validar
- Se quiere verificar que los servicios Docker estan funcionando
- Se escriben tests e2e con Playwright
- Se valida un flujo n8n de punta a punta
- Se necesita un quality gate antes de un release

## Niveles de Testing

| Nivel | Herramienta | Que valida | Cuando ejecutar |
|-------|-------------|------------|-----------------|
| Smoke | `tests/smoke-test.sh` | Servicios vivos, conectividad | Despues de `docker compose up` |
| Unit | Jest (boki-api) | Logica de negocio aislada | En cada PR / commit |
| E2E | Playwright | Flujos completos de usuario | Antes de release |
| Flow | n8n manual | Flujos WhatsApp completos | Al modificar flujos n8n |

---

## Smoke Tests (OBLIGATORIO)

Ejecutar despues de cualquier cambio en Docker:

```bash
./tests/smoke-test.sh solercia.com.co     # Produccion
./tests/smoke-test.sh localhost            # Local
```

Verifica:
- Contenedores corriendo (traefik, postgres, flows, solercia-web, mongo_boki, boki-api)
- Endpoints HTTP respondiendo (200)
- Bases de datos accesibles
- Certificados SSL validos
- Red Docker activa
- Sin credenciales hardcoded

---

## Playwright E2E (RECOMENDADO)

### Estructura de tests

```
tests/e2e/
├── base-page.ts          # Clase base para Page Objects
├── helpers.ts            # Utilidades compartidas
└── {pagina}/
    ├── {pagina}-page.ts  # Page Object Model
    ├── {pagina}.spec.ts  # TODOS los tests de esa pagina
    └── {pagina}.md       # Documentacion del test
```

### Selectores (prioridad)

```typescript
// 1. MEJOR - getByRole para elementos interactivos
page.getByRole('button', { name: 'Agendar Cita' });

// 2. MEJOR - getByLabel para formularios
page.getByLabel('Correo electronico');

// 3. ACEPTABLE - getByText para contenido estatico
page.getByText('Bienvenido a Solercia');

// 4. ULTIMO RECURSO - getByTestId
page.getByTestId('chatbot-widget');

// ❌ PROHIBIDO - selectores fragiles
page.locator('.btn-primary');    // NO
page.locator('#email');          // NO
page.locator('div > span > a'); // NO
```

### Page Object Pattern

```typescript
export class ChatbotPage extends BasePage {
  readonly chatButton: Locator;
  readonly messageInput: Locator;
  readonly sendButton: Locator;

  constructor(page: Page) {
    super(page);
    this.chatButton = page.getByRole('button', { name: 'Abrir chat' });
    this.messageInput = page.getByPlaceholder('Escribe tu mensaje...');
    this.sendButton = page.getByRole('button', { name: 'Enviar mensaje' });
  }

  async openChat(): Promise<void> {
    await this.chatButton.click();
  }

  async sendMessage(text: string): Promise<void> {
    await this.messageInput.fill(text);
    await this.sendButton.click();
  }
}
```

---

## Validacion de Flujos n8n

### Checklist pre-deploy

- [ ] Todas las credenciales usan `{{ $env.VARIABLE }}`, no valores hardcoded
- [ ] URLs base son variables de entorno
- [ ] No hay SQL injection (variables de usuario no interpoladas directamente)
- [ ] Error handling configurado (nodos de error en cada sub-flujo)
- [ ] Session management funciona (crear, recuperar, timeout)
- [ ] Token tracking activo (Control-Tokens recibe datos)
- [ ] WhatsApp responde correctamente (texto, botones, listas)

### Test manual de flujo completo

1. Enviar mensaje por WhatsApp al numero de prueba
2. Verificar que MainFlow recibe el mensaje
3. Si cliente nuevo → RegisterClient funciona (cedula + nombre)
4. Si cliente existente → intent detection funciona
5. Si intent = cita → AppointmentFlow completa el agendamiento
6. Si intent = FAQ → FlowFaqs responde con IA
7. Control-Tokens registra uso

---

## Quality Gate (antes de release)

### Criterios de aprobacion

| Criterio | Obligatorio | Como verificar |
|----------|-------------|----------------|
| Smoke tests pasan | SI | `./tests/smoke-test.sh` retorna 0 |
| Sin credenciales expuestas | SI | `grep -r "password\|token\|secret" --include="*.yml" --include="*.json"` |
| .env no trackeado | SI | `git ls-files .env` retorna vacio |
| Docker levanta sin errores | SI | `docker compose up -d && docker compose ps` |
| API responde | SI | `curl https://boki-api.solercia.com.co/api-docs` |
| Flujo WhatsApp funciona | SI (beta+) | Test manual de agendamiento |
| Playwright pasa | NO (MVP-1) | `npx playwright test` |

### Severidades

| Severidad | Descripcion | Bloquea release? |
|-----------|-------------|-----------------|
| CRITICO | Seguridad, datos corrompidos, servicio caido | SI |
| ALTO | Funcionalidad core rota, error visible | SI |
| MEDIO | UI rota pero funcional, warning en consola | NO |
| BAJO | Cosmetico, mejora de UX | NO |

---

## Anti-Patterns

### No: Tests sin assertions

```typescript
// ❌ MAL - test que no verifica nada
test('pagina carga', async ({ page }) => {
  await page.goto('/');
  // ... y ya? Donde esta el expect?
});

// ✅ BIEN - test con verificacion explicita
test('pagina carga con logo de Solercia', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('img', { name: 'Solercia' })).toBeVisible();
});
```

### No: Tests que dependen de orden

```typescript
// ❌ MAL - test 2 depende de que test 1 haya corrido
test('crear cita', async () => { /* crea cliente */ });
test('ver cita', async () => { /* asume que cliente ya existe */ });

// ✅ BIEN - cada test es independiente
test('ver cita', async () => {
  // Setup: crear cliente y cita
  // Act: navegar a mis citas
  // Assert: la cita aparece
});
```

---

## Comandos

```bash
# Smoke tests
./tests/smoke-test.sh localhost

# Playwright
npx playwright test                    # Todos
npx playwright test --grep "chatbot"   # Filtrar
npx playwright test --ui               # Modo visual
npx playwright test --debug            # Debug

# Jest (boki-api)
cd boki-api && npm test

# Docker health
docker compose ps
docker compose logs -f boki-api
```
