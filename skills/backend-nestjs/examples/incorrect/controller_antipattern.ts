/**
 * ============================================================================
 * ANTI-PATRON: CONTROLADOR INCORRECTO - boki-api
 * ============================================================================
 * Este archivo muestra COMO NO se debe escribir un controlador.
 * Cada seccion esta marcada con el error y la correccion sugerida.
 * ============================================================================
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// =====================================================================
// ERROR 1: El controlador NO extiende BaseCrudController
// CORRECCION: Extender BaseCrudController<Entity, CreateDto, UpdateDto>
// =====================================================================

// ERROR 2: Nombre de ruta en PascalCase en vez de kebab-case
// CORRECCION: @Controller('order-detail') o @Controller('orderDetail')
@Controller('OrderDetail')
export class OrderDetailController {
  // =====================================================================
  // ERROR 3: Inyectar el repositorio directamente en el controlador
  // CORRECCION: Usar un servicio que extienda BaseCrudService
  // =====================================================================
  constructor(
    @InjectRepository(OrderDetailEntity)
    private readonly repository: Repository<OrderDetailEntity>,
  ) {}

  // =====================================================================
  // ERROR 4: Logica de negocio directamente en el controlador
  // CORRECCION: Mover toda la logica al servicio (validateCreate, etc.)
  // =====================================================================
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: any) {
    // ERROR 5: Usar 'any' como tipo del body en lugar de un DTO tipado
    // CORRECCION: Usar CreateOrderDetailDto

    // ERROR 6: Validacion manual en el controlador
    // CORRECCION: Usar Joi schema con @UseJoiValidationPipe()
    if (!body.name) {
      throw new Error('El nombre es requerido');
    }

    if (!body.price || body.price < 0) {
      throw new Error('El precio debe ser mayor a 0');
    }

    // ERROR 7: Acceso directo al repositorio desde el controlador
    // CORRECCION: Llamar al servicio: this.service.create(dto)
    const existingOrder = await this.repository.findOne({
      where: { name: body.name },
    });

    if (existingOrder) {
      // ERROR 8: Usar 'throw new Error' en vez de excepciones de NestJS
      // CORRECCION: throw new ConflictException(errors, 'mensaje en espanol')
      throw new Error('Ya existe una orden con este nombre');
    }

    const entity = this.repository.create(body);
    const saved = await this.repository.save(entity);

    // ERROR 9: Retornar datos sin la estructura estandar { message, data }
    // CORRECCION: return { message: '... creado de forma exitosa', data: saved }
    return saved;
  }

  @Get()
  async findAll() {
    // ERROR 10: Sin HttpCode decorator
    // CORRECCION: @HttpCode(HttpStatus.OK)

    const results = await this.repository.find();

    // ERROR 11: Mensaje en ingles
    // CORRECCION: Todos los mensajes deben estar en espanol
    return {
      message: 'Orders retrieved successfully',
      data: results,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    // ERROR 12: No usar ParseIntPipe para validar el parametro
    // CORRECCION: @Param('id', ParseIntPipe) id: number

    // ERROR 13: Parsear manualmente el ID
    // CORRECCION: ParseIntPipe lo hace automaticamente
    const numericId = parseInt(id);

    const entity = await this.repository.findOne({
      where: { id: numericId },
    });

    if (!entity) {
      // ERROR 14: Mensaje de error en ingles y usar Error generico
      // CORRECCION: throw new NotFoundException('Entidad no encontrada')
      throw new Error('Not found');
    }

    return entity;
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    // ERROR 15: Logica de actualizacion duplicada (ya esta en BaseCrudService)
    // CORRECCION: Heredar de BaseCrudController que llama a service.update()
    const entity = await this.repository.findOne({
      where: { id: parseInt(id) },
    });

    if (!entity) {
      throw new Error('Not found');
    }

    // ERROR 16: Object.assign directo sin usar prepareUpdateData hook
    // CORRECCION: Sobreescribir prepareUpdateData() en el servicio
    Object.assign(entity, body);
    return await this.repository.save(entity);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    // ERROR 17: Eliminar sin validar que existe antes
    // CORRECCION: El BaseCrudService.remove() ya valida existencia con findOne()
    await this.repository.delete(parseInt(id));

    // ERROR 18: Retornar string plano en vez de objeto estandar
    // CORRECCION: return { message: '... eliminado de forma exitosa', data: null }
    return 'Deleted';
  }
}

// =====================================================================
// ERROR 19: Entidad con naming incorrecto (aqui solo como referencia)
// =====================================================================
class OrderDetailEntity {
  // ERROR 20: Propiedades en camelCase en vez de PascalCase
  // CORRECCION: Id, VcName, IPrice
  id: number;
  name: string;
  price: number;
}

/**
 * ============================================================================
 * RESUMEN DE ERRORES EN ESTE ARCHIVO:
 * ============================================================================
 *
 * 1.  No extiende BaseCrudController
 * 2.  Ruta del controlador en PascalCase
 * 3.  Repositorio inyectado directamente en el controlador
 * 4.  Logica de negocio en el controlador (debe estar en el servicio)
 * 5.  Tipo 'any' en @Body() en vez de DTO tipado
 * 6.  Validacion manual en vez de Joi schema
 * 7.  Acceso directo al repositorio en vez de usar el servicio
 * 8.  throw new Error() en vez de excepciones NestJS (ConflictException, etc.)
 * 9.  Retorno sin estructura estandar { message, data }
 * 10. Falta @HttpCode decorator
 * 11. Mensajes en ingles (deben ser en espanol)
 * 12. No usa ParseIntPipe en @Param
 * 13. Parseo manual del ID
 * 14. NotFoundException no utilizado
 * 15. Logica de update duplicada (ya provista por BaseCrudService)
 * 16. Object.assign sin hook prepareUpdateData
 * 17. Delete sin validar existencia previa
 * 18. Retorno de string plano en vez de objeto estructurado
 * 19. Entidad con naming incorrecto
 * 20. Propiedades en camelCase en vez de PascalCase
 *
 * ============================================================================
 * VERSION CORREGIDA (resumida):
 * ============================================================================
 *
 * @Controller('order-detail')
 * @UsePipes(new ValidationPipe({
 *   transform: true,
 *   forbidNonWhitelisted: true,
 *   transformOptions: { enableImplicitConversion: true }
 * }))
 * export class OrderDetailController extends BaseCrudController<
 *   OrderDetailEntity,
 *   CreateOrderDetailDto,
 *   UpdateOrderDetailDto
 * > {
 *   constructor(
 *     @Inject(OrderDetailService)
 *     private readonly orderDetailService: OrderDetailService
 *   ) {
 *     super(
 *       orderDetailService,
 *       'detalle de orden',
 *       createOrderDetailSchema,
 *       updateOrderDetailSchema
 *     );
 *   }
 *
 *   // Solo agregar endpoints ADICIONALES aqui.
 *   // Los CRUD basicos (POST, GET, GET/:id, PUT/:id, DELETE/:id)
 *   // ya estan heredados de BaseCrudController.
 * }
 *
 * ============================================================================
 */
