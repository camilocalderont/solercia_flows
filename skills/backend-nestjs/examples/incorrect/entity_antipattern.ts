/**
 * ============================================================================
 * ANTI-PATRON: ENTIDAD TYPEORM INCORRECTA - boki-api
 * ============================================================================
 * Este archivo muestra COMO NO se debe definir una entidad.
 * Cada linea tiene el error marcado y la correccion sugerida.
 * ============================================================================
 */

import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

// =====================================================================
// ERROR 1: Nombre de tabla en minusculas y en espanol
// CORRECCION: @Entity('Invoice') - PascalCase, singular, en ingles
// =====================================================================
@Entity('facturas')
export class Factura {

  // =====================================================================
  // ERROR 2: Primary key en minuscula 'id'
  // CORRECCION: Id (PascalCase) - @PrimaryGeneratedColumn() Id: number;
  // =====================================================================
  @PrimaryGeneratedColumn()
  id: number;

  // =====================================================================
  // ERROR 3: Columna sin prefijo de tipo y propiedad en snake_case
  // CORRECCION: @Column({ name: 'vc_invoice_number', type: 'varchar', length: 50 })
  //             VcInvoiceNumber: string;
  // =====================================================================
  @Column()
  numero_factura: string;

  // =====================================================================
  // ERROR 4: Columna sin name explicito, sin tipo, propiedad en camelCase
  // CORRECCION: @Column({ name: 'vc_client_name', type: 'varchar', length: 200 })
  //             VcClientName: string;
  // =====================================================================
  @Column()
  clientName: string;

  // =====================================================================
  // ERROR 5: Columna numerica sin prefijo in_ o i_
  // CORRECCION: @Column({ name: 'i_total', type: 'int' })
  //             ITotal: number;
  // =====================================================================
  @Column()
  total: number;

  // =====================================================================
  // ERROR 6: Columna decimal sin prefijo d_, sin precision/scale
  // CORRECCION: @Column({ name: 'd_tax_rate', type: 'decimal', precision: 5, scale: 2 })
  //             DTaxRate: number;
  // =====================================================================
  @Column({ type: 'float' })
  impuesto: number;

  // =====================================================================
  // ERROR 7: Columna boolean sin prefijo b_
  // CORRECCION: @Column({ name: 'b_is_active', type: 'boolean', default: true })
  //             BIsActive: boolean;
  // =====================================================================
  @Column({ default: true })
  activo: boolean;

  // =====================================================================
  // ERROR 8: Fecha como string en vez de Date, sin prefijo dt_
  // CORRECCION: @Column({ name: 'dt_issue_date', type: 'timestamp' })
  //             DtIssueDate: Date;
  // =====================================================================
  @Column()
  fecha_emision: string;

  // =====================================================================
  // ERROR 9: Texto largo sin prefijo tx_
  // CORRECCION: @Column({ name: 'tx_notes', type: 'text', nullable: true })
  //             TxNotes: string;
  // =====================================================================
  @Column()
  notas: string;

  // =====================================================================
  // ERROR 10: Email como propiedad en espanol sin prefijo vc_
  // CORRECCION: @Column({ name: 'vc_contact_email', type: 'varchar', length: 100 })
  //             VcContactEmail: string;
  // =====================================================================
  @Column()
  correo_contacto: string;

  // =====================================================================
  // ERROR 11: Foreign key sin @Index, sin tipo explicito
  // CORRECCION: @Index()
  //             @Column({ name: 'company_id', type: 'int' })
  //             CompanyId: number;
  // =====================================================================
  @Column()
  empresaId: number;

  // =====================================================================
  // ERROR 12: Falta @CreateDateColumn y @UpdateDateColumn
  // CORRECCION: Siempre incluir timestamps:
  //   @CreateDateColumn({ name: 'created_at' })
  //   created_at: Date;
  //
  //   @UpdateDateColumn({ name: 'updated_at' })
  //   updated_at: Date;
  // =====================================================================

  // =====================================================================
  // ERROR 13: Falta relaciones TypeORM (@ManyToOne, @OneToMany, @JoinColumn)
  // CORRECCION: Definir relaciones con decoradores TypeORM:
  //   @ManyToOne(() => CompanyEntity, company => company.Invoices)
  //   @JoinColumn({ name: 'company_id' })
  //   Company: CompanyEntity;
  // =====================================================================
}

/**
 * ============================================================================
 * RESUMEN DE ERRORES EN ESTA ENTIDAD:
 * ============================================================================
 *
 * 1.  Tabla en minusculas y espanol ('facturas') -> Debe ser PascalCase ('Invoice')
 * 2.  Primary key 'id' en minuscula -> Debe ser 'Id' en PascalCase
 * 3.  Propiedad snake_case 'numero_factura' -> Debe ser PascalCase 'VcInvoiceNumber'
 * 4.  Propiedad camelCase 'clientName' -> Debe ser PascalCase 'VcClientName'
 * 5.  Columna numerica sin prefijo 'total' -> Debe ser 'ITotal' con name: 'i_total'
 * 6.  Decimal sin prefijo y con 'float' -> Debe ser 'DTaxRate' con type: 'decimal'
 * 7.  Boolean sin prefijo 'activo' -> Debe ser 'BIsActive' con name: 'b_is_active'
 * 8.  Fecha como string sin prefijo -> Debe ser Date con name: 'dt_issue_date'
 * 9.  Texto sin prefijo 'notas' -> Debe ser 'TxNotes' con name: 'tx_notes'
 * 10. Email en espanol sin prefijo -> Debe ser 'VcContactEmail'
 * 11. Foreign key sin @Index y mal nombrada -> Debe ser 'CompanyId' con @Index
 * 12. Sin timestamps (created_at, updated_at)
 * 13. Sin relaciones TypeORM (@ManyToOne, @OneToMany)
 *
 * ============================================================================
 * VERSION CORREGIDA:
 * ============================================================================
 *
 * @Entity('Invoice')
 * export class InvoiceEntity {
 *   @PrimaryGeneratedColumn()
 *   Id: number;
 *
 *   @Column({ name: 'vc_invoice_number', type: 'varchar', length: 50, unique: true })
 *   VcInvoiceNumber: string;
 *
 *   @Column({ name: 'vc_client_name', type: 'varchar', length: 200 })
 *   VcClientName: string;
 *
 *   @Column({ name: 'i_total', type: 'int' })
 *   ITotal: number;
 *
 *   @Column({ name: 'd_tax_rate', type: 'decimal', precision: 5, scale: 2 })
 *   DTaxRate: number;
 *
 *   @Column({ name: 'b_is_active', type: 'boolean', default: true })
 *   BIsActive: boolean;
 *
 *   @Column({ name: 'dt_issue_date', type: 'timestamp' })
 *   DtIssueDate: Date;
 *
 *   @Column({ name: 'tx_notes', type: 'text', nullable: true })
 *   TxNotes: string;
 *
 *   @Column({ name: 'vc_contact_email', type: 'varchar', length: 100 })
 *   VcContactEmail: string;
 *
 *   @Index()
 *   @Column({ name: 'company_id', type: 'int' })
 *   CompanyId: number;
 *
 *   @ManyToOne(() => CompanyEntity, company => company.Invoices)
 *   @JoinColumn({ name: 'company_id' })
 *   Company: CompanyEntity;
 *
 *   @CreateDateColumn({ name: 'created_at' })
 *   created_at: Date;
 *
 *   @UpdateDateColumn({ name: 'updated_at' })
 *   updated_at: Date;
 * }
 *
 * ============================================================================
 */
