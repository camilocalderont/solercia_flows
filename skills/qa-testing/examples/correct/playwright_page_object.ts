// ✅ CORRECTO: Page Object con selectores accesibles y metodos claros
import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
  constructor(protected page: Page) {}

  async goto(path: string): Promise<void> {
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
  }

  async waitForNotification(): Promise<void> {
    await this.page.waitForSelector('[role="status"]');
  }
}

// Datos tipados para el formulario
export interface AppointmentData {
  service: string;
  date: string;
  time: string;
  notes?: string;
}

// Page Object especifico
export class AppointmentPage extends BasePage {
  // Selectores usando roles y labels (NO clases CSS)
  readonly serviceSelect: Locator;
  readonly dateInput: Locator;
  readonly timeSelect: Locator;
  readonly notesInput: Locator;
  readonly submitButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.serviceSelect = page.getByLabel('Servicio');
    this.dateInput = page.getByLabel('Fecha');
    this.timeSelect = page.getByLabel('Hora');
    this.notesInput = page.getByLabel('Notas');
    this.submitButton = page.getByRole('button', { name: 'Agendar Cita' });
    this.successMessage = page.getByText('Cita agendada exitosamente');
  }

  async goto(): Promise<void> {
    await super.goto('/appointments/new');
  }

  async fillAppointment(data: AppointmentData): Promise<void> {
    await this.serviceSelect.selectOption(data.service);
    await this.dateInput.fill(data.date);
    await this.timeSelect.selectOption(data.time);
    if (data.notes) {
      await this.notesInput.fill(data.notes);
    }
    await this.submitButton.click();
  }

  async verifySuccess(): Promise<void> {
    await expect(this.successMessage).toBeVisible();
  }
}
