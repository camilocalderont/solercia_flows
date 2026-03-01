// ❌ INCORRECTO: Test con selectores fragiles, sin Page Object, dependiente de orden

import { test } from '@playwright/test';

// ❌ MAL: No usa Page Object
// ❌ MAL: Selectores por clases CSS y IDs (fragiles)
// ❌ MAL: No tiene assertions (expect)
// ❌ MAL: Depende de datos hardcoded
// ❌ MAL: No tiene cleanup

test('crear cita', async ({ page }) => {
  await page.goto('/appointments');

  // ❌ Selector por clase CSS - se rompe si cambia el estilo
  await page.locator('.btn-new-appointment').click();

  // ❌ Selector por ID - fragil
  await page.locator('#service-select').selectOption('1');

  // ❌ Selector por estructura DOM - extremadamente fragil
  await page.locator('div.form > div:nth-child(3) > input').fill('2026-03-15');

  // ❌ Datos hardcoded que pueden no existir en la DB
  await page.locator('#professional-id').fill('123');

  await page.locator('form button[type="submit"]').click();

  // ❌ No hay expect/assertion - el test SIEMPRE pasa
  // ❌ No verifica resultado
  // ❌ No limpia los datos de prueba
});

// ❌ MAL: Test que depende del anterior
test('ver cita creada', async ({ page }) => {
  // Este test asume que "crear cita" ya corrio y creo datos
  // Si corren en paralelo o en orden diferente, FALLA
  await page.goto('/appointments');
  await page.locator('.appointment-list tr:last-child').click();
});
