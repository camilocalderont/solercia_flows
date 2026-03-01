/**
 * ============================================================================
 * EJEMPLO CORRECTO DE ENTIDAD TYPEORM - boki-api
 * ============================================================================
 * Demuestra las convenciones correctas de naming para entidades:
 * - Tabla: PascalCase singular
 * - Columnas DB: snake_case con prefijo de tipo
 * - Propiedades TS: PascalCase
 * - Foreign keys: snake_case sin prefijo de tipo
 * - Timestamps: created_at, updated_at
 * ============================================================================
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';

/**
 * Entidad Invoice (Factura)
 *
 * Tabla: 'Invoice' (PascalCase, singular)
 * Demuestra todos los tipos de columnas con sus prefijos correctos.
 */
@Entity('Invoice')
export class InvoiceEntity {
  // =========================================================================
  // PRIMARY KEY - Siempre 'Id' en PascalCase
  // =========================================================================
  @PrimaryGeneratedColumn()
  Id: number;

  // =========================================================================
  // VARCHAR (vc_) - Cadenas de texto con longitud definida
  // =========================================================================

  // Numero de factura
  @Column({ name: 'vc_invoice_number', type: 'varchar', length: 50, unique: true })
  VcInvoiceNumber: string;

  // Nombre del cliente en la factura
  @Column({ name: 'vc_client_name', type: 'varchar', length: 200 })
  VcClientName: string;

  // Email de contacto (puede ser null)
  @Column({ name: 'vc_contact_email', type: 'varchar', length: 100, nullable: true })
  VcContactEmail: string;

  // Estado de la factura (borrador, enviada, pagada, cancelada)
  @Column({ name: 'vc_status', type: 'varchar', length: 20, default: 'borrador' })
  VcStatus: string;

  // =========================================================================
  // INTEGER (in_ o i_) - Numeros enteros
  // =========================================================================

  // Cantidad total de items
  @Column({ name: 'in_total_items', type: 'int', default: 0 })
  InTotalItems: number;

  // Subtotal en centavos (para evitar decimales)
  @Column({ name: 'i_subtotal', type: 'int' })
  ISubtotal: number;

  // Total en centavos
  @Column({ name: 'i_total', type: 'int' })
  ITotal: number;

  // =========================================================================
  // DECIMAL (d_) - Numeros con decimales
  // =========================================================================

  // Porcentaje de descuento aplicado
  @Column({ name: 'd_discount_percent', type: 'decimal', precision: 5, scale: 2, default: 0 })
  DDiscountPercent: number;

  // Tasa de impuesto
  @Column({ name: 'd_tax_rate', type: 'decimal', precision: 5, scale: 2, default: 19.0 })
  DTaxRate: number;

  // =========================================================================
  // BOOLEAN (b_) - Valores verdadero/falso
  // =========================================================================

  // Indica si la factura esta activa (no eliminada logicamente)
  @Column({ name: 'b_is_active', type: 'boolean', default: true })
  BIsActive: boolean;

  // Indica si la factura fue enviada por email
  @Column({ name: 'b_is_sent', type: 'boolean', default: false })
  BIsSent: boolean;

  // Indica si tiene retencion en la fuente
  @Column({ name: 'b_has_withholding', type: 'boolean', default: false })
  BHasWithholding: boolean;

  // =========================================================================
  // DATETIME (dt_) - Fechas y timestamps
  // =========================================================================

  // Fecha de emision de la factura
  @Column({ name: 'dt_issue_date', type: 'timestamp' })
  DtIssueDate: Date;

  // Fecha de vencimiento
  @Column({ name: 'dt_due_date', type: 'timestamp' })
  DtDueDate: Date;

  // Fecha de pago (null si no se ha pagado)
  @Column({ name: 'dt_payment_date', type: 'timestamp', nullable: true })
  DtPaymentDate: Date;

  // =========================================================================
  // TEXT (tx_) - Texto largo sin limite de caracteres
  // =========================================================================

  // Notas internas de la factura
  @Column({ name: 'tx_internal_notes', type: 'text', nullable: true })
  TxInternalNotes: string;

  // Terminos y condiciones
  @Column({ name: 'tx_terms', type: 'text', nullable: true })
  TxTerms: string;

  // =========================================================================
  // FOREIGN KEYS - snake_case sin prefijo, con @Index
  // =========================================================================

  // Relacion con la empresa que emite la factura
  @Index()
  @Column({ name: 'company_id', type: 'int' })
  CompanyId: number;

  // Relacion con el cliente
  @Index()
  @Column({ name: 'client_id', type: 'int' })
  ClientId: number;

  // =========================================================================
  // RELACIONES TypeORM
  // =========================================================================

  @ManyToOne(() => CompanyEntityRef, (company) => company.Invoices)
  @JoinColumn({ name: 'company_id' })
  Company: CompanyEntityRef;

  @ManyToOne(() => ClientEntityRef, (client) => client.Invoices)
  @JoinColumn({ name: 'client_id' })
  Client: ClientEntityRef;

  // Relacion inversa: una factura tiene muchos items
  @OneToMany(() => InvoiceItemEntity, (item) => item.Invoice)
  Items: InvoiceItemEntity[];

  // =========================================================================
  // TIMESTAMPS - Siempre al final, siempre snake_case
  // =========================================================================

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}

/**
 * Entidad InvoiceItem (Item de Factura)
 * Demuestra entidad hija con relacion ManyToOne.
 */
@Entity('InvoiceItem')
export class InvoiceItemEntity {
  @PrimaryGeneratedColumn()
  Id: number;

  @Column({ name: 'vc_description', type: 'varchar', length: 300 })
  VcDescription: string;

  @Column({ name: 'in_quantity', type: 'int' })
  InQuantity: number;

  @Column({ name: 'i_unit_price', type: 'int' })
  IUnitPrice: number;

  @Column({ name: 'i_total_price', type: 'int' })
  ITotalPrice: number;

  @Column({ name: 'd_discount', type: 'decimal', precision: 5, scale: 2, default: 0 })
  DDiscount: number;

  // Foreign key hacia la factura padre
  @Index()
  @Column({ name: 'invoice_id', type: 'int' })
  InvoiceId: number;

  @ManyToOne(() => InvoiceEntity, (invoice) => invoice.Items)
  @JoinColumn({ name: 'invoice_id' })
  Invoice: InvoiceEntity;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}

// =========================================================================
// Referencias de entidades externas (en produccion se importan de sus modulos)
// =========================================================================

class CompanyEntityRef {
  Invoices: InvoiceEntity[];
}

class ClientEntityRef {
  Invoices: InvoiceEntity[];
}
