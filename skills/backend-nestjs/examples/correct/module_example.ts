/**
 * ============================================================================
 * EJEMPLO COMPLETO DE MODULO NESTJS - boki-api
 * ============================================================================
 * Este archivo muestra la estructura correcta de un modulo feature completo.
 * En produccion, cada seccion iria en su archivo correspondiente.
 *
 * Estructura de archivos:
 *   modules/product/
 *     product.module.ts
 *     entities/product.entity.ts
 *     controllers/product.controller.ts
 *     services/product.service.ts
 *     dto/productCreate.dto.ts
 *     dto/productUpdate.dto.ts
 *     schemas/productCreate.schema.ts
 *     schemas/productUpdate.schema.ts
 *     repositories/product.repository.ts
 * ============================================================================
 */

// =============================================================================
// 1. ENTIDAD - entities/product.entity.ts
// =============================================================================

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

// Tabla en PascalCase singular
@Entity('Product')
export class ProductEntity {
  // Primary key siempre como 'Id'
  @PrimaryGeneratedColumn()
  Id: number;

  // Columnas varchar: prefijo vc_, propiedad PascalCase
  @Column({ name: 'vc_name', type: 'varchar', length: 200 })
  VcName: string;

  @Column({ name: 'vc_description', type: 'varchar', length: 500, nullable: true })
  VcDescription: string;

  // Columnas integer: prefijo in_ o i_
  @Column({ name: 'in_stock', type: 'int', default: 0 })
  InStock: number;

  @Column({ name: 'i_price', type: 'int' })
  IPrice: number;

  // Columnas decimal: prefijo d_
  @Column({ name: 'd_tax_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  DTaxRate: number;

  // Columnas boolean: prefijo b_
  @Column({ name: 'b_is_active', type: 'boolean', default: true })
  BIsActive: boolean;

  // Columnas text: prefijo tx_
  @Column({ name: 'tx_notes', type: 'text', nullable: true })
  TxNotes: string;

  // Foreign key: snake_case sin prefijo de tipo, con @Index
  @Index()
  @Column({ name: 'company_id', type: 'int' })
  CompanyId: number;

  // Relacion ManyToOne
  @ManyToOne(() => CompanyEntity, (company) => company.Products)
  @JoinColumn({ name: 'company_id' })
  Company: CompanyEntity;

  // Timestamps: siempre created_at y updated_at
  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}

// Referencia para la relacion (en produccion se importa del modulo company)
class CompanyEntity {
  Products: ProductEntity[];
}

// =============================================================================
// 2. DTOs - dto/productCreate.dto.ts y dto/productUpdate.dto.ts
// =============================================================================

// --- dto/productCreate.dto.ts ---
// Las propiedades usan PascalCase, igual que la entidad
export class CreateProductDto {
  VcName: string;
  VcDescription?: string;
  InStock?: number;
  IPrice: number;
  DTaxRate?: number;
  BIsActive?: boolean;
  TxNotes?: string;
  CompanyId: number;
}

// --- dto/productUpdate.dto.ts ---
// Todas las propiedades son opcionales en update
export class UpdateProductDto {
  VcName?: string;
  VcDescription?: string;
  InStock?: number;
  IPrice?: number;
  DTaxRate?: number;
  BIsActive?: boolean;
  TxNotes?: string;
}

// =============================================================================
// 3. JOI SCHEMAS - schemas/productCreate.schema.ts y schemas/productUpdate.schema.ts
// =============================================================================

import Joi from 'joi';
import { joiMessagesES } from '../../../shared/utils/joi-messages';

// --- schemas/productCreate.schema.ts ---
// Los nombres de las propiedades coinciden con los DTOs (PascalCase)
export const createProductSchema = Joi.object({
  VcName: Joi.string().min(2).max(200).required(),
  VcDescription: Joi.string().max(500).optional().allow('', null),
  InStock: Joi.number().integer().min(0).optional().default(0),
  IPrice: Joi.number().integer().min(0).required(),
  DTaxRate: Joi.number().min(0).max(100).optional().default(0),
  BIsActive: Joi.boolean().optional().default(true),
  TxNotes: Joi.string().optional().allow('', null),
  CompanyId: Joi.number().integer().positive().required(),
}).messages(joiMessagesES); // Siempre usar mensajes en espanol

// --- schemas/productUpdate.schema.ts ---
// En update, ningun campo es obligatorio
export const updateProductSchema = Joi.object({
  VcName: Joi.string().min(2).max(200).optional(),
  VcDescription: Joi.string().max(500).optional().allow('', null),
  InStock: Joi.number().integer().min(0).optional(),
  IPrice: Joi.number().integer().min(0).optional(),
  DTaxRate: Joi.number().min(0).max(100).optional(),
  BIsActive: Joi.boolean().optional(),
  TxNotes: Joi.string().optional().allow('', null),
}).messages(joiMessagesES);

// =============================================================================
// 4. REPOSITORIO (OPCIONAL) - repositories/product.repository.ts
// =============================================================================

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ProductRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  // Metodos custom de consulta van aqui
  async findByCompany(companyId: number): Promise<ProductEntity[]> {
    return this.productRepository.find({
      where: { CompanyId: companyId, BIsActive: true },
      order: { VcName: 'ASC' },
    });
  }
}

// =============================================================================
// 5. SERVICIO - services/product.service.ts
// =============================================================================

import { ConflictException, BadRequestException, Inject } from '@nestjs/common';
import { BaseCrudService } from '../../../shared/services/crud.services';
import { ApiErrorItem } from '~/api/shared/interfaces/api-response.interface';

@Injectable()
export class ProductService extends BaseCrudService<ProductEntity, CreateProductDto, UpdateProductDto> {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productEntityRepository: Repository<ProductEntity>,
    @Inject(ProductRepository)
    private readonly productRepository: ProductRepository,
  ) {
    // Pasar el repositorio TypeORM al BaseCrudService
    super(productEntityRepository);
  }

  // Hook: Validar antes de crear
  protected async validateCreate(dto: CreateProductDto): Promise<void> {
    const errors: ApiErrorItem[] = [];

    // Validar que no exista un producto con el mismo nombre en la misma empresa
    const existing = await this.productEntityRepository.findOne({
      where: { VcName: dto.VcName, CompanyId: dto.CompanyId },
    });

    if (existing) {
      errors.push({
        code: 'PRODUCTO_YA_EXISTE',
        message: 'Ya existe un producto con este nombre para esta empresa.',
        field: 'VcName',
      });
    }

    // Lanzar todos los errores acumulados
    if (errors.length > 0) {
      throw new ConflictException(errors, 'Error en la creacion del producto');
    }
  }

  // Hook: Acciones despues de crear
  protected async afterCreate(entity: ProductEntity): Promise<void> {
    console.log(`Producto creado: ${entity.VcName} (ID: ${entity.Id})`);
    // Aqui se podrian enviar notificaciones, actualizar cache, etc.
  }

  // Hook: Validar antes de actualizar
  protected async validateUpdate(id: number, dto: UpdateProductDto): Promise<void> {
    // Validaciones personalizadas antes del update
  }

  // Hook: Preparar datos antes de guardar update
  protected async prepareUpdateData(
    entity: ProductEntity,
    dto: UpdateProductDto,
  ): Promise<Partial<ProductEntity> | UpdateProductDto> {
    // Transformar datos si es necesario antes de guardar
    return dto;
  }

  // Metodos custom adicionales
  async findByCompany(companyId: number): Promise<ProductEntity[]> {
    return this.productRepository.findByCompany(companyId);
  }
}

// =============================================================================
// 6. CONTROLADOR - controllers/product.controller.ts
// =============================================================================

import { Controller, UsePipes, ValidationPipe, Get, Param, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { BaseCrudController } from '../../../shared/controllers/crud.controller';
import { ApiControllerResponse } from '~/api/shared/interfaces/api-response.interface';

@Controller('product')
@UsePipes(
  new ValidationPipe({
    transform: true,
    forbidNonWhitelisted: true,
    transformOptions: { enableImplicitConversion: true },
  }),
)
export class ProductController extends BaseCrudController<ProductEntity, CreateProductDto, UpdateProductDto> {
  constructor(
    @Inject(ProductService)
    private readonly productService: ProductService,
  ) {
    // Parametros: servicio, nombre para mensajes, schema crear, schema actualizar
    super(productService, 'producto', createProductSchema, updateProductSchema);
  }

  // Endpoint custom adicional (los CRUD basicos ya estan heredados)
  @Get('company/:companyId')
  @HttpCode(HttpStatus.OK)
  async findByCompany(
    @Param('companyId', ParseIntPipe) companyId: number,
  ): Promise<ApiControllerResponse<ProductEntity[]>> {
    const data = await this.productService.findByCompany(companyId);
    return {
      message: 'Lista de productos por empresa obtenida de forma exitosa',
      data,
    };
  }
}

// =============================================================================
// 7. MODULO - product.module.ts
// =============================================================================

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    // Registrar la entidad con TypeORM
    TypeOrmModule.forFeature([ProductEntity]),
  ],
  controllers: [ProductController],
  providers: [
    ProductRepository,
    {
      provide: ProductService,
      useClass: ProductService,
    },
  ],
  // Exportar el servicio si otros modulos lo necesitan
  exports: [ProductService],
})
export class ProductModule {}
