import { Product } from '../models/product.model';

export interface CreateProductDto {
  customerId: number;
  name:        string;
  description?:string;
  price:       number;
  taxRate?:    number;
}

export interface UpdateProductDto {
  name?:        string;
  description?: string;
  price?:       number;
  taxRate?:     number;
}

/**
 * Crea un producto nuevo (error si ya existe para ese customerId).
 */
export async function createProduct(dto: CreateProductDto) {
  const existing = await Product.findOne({
    where: { customerId: dto.customerId, name: dto.name }
  });
  if (existing) {
    throw new Error(`El producto "${dto.name}" ya existe para customerId=${dto.customerId}`);
  }
  return Product.create({
    customerId:  dto.customerId,
    name:        dto.name,
    description: dto.description ?? undefined,
    price:       dto.price,
    taxRate:     dto.taxRate   ?? 0
  });
}

/**
 * Lista todos los productos de un cliente.
 */
export async function listProductsByCustomer(customerId: number) {
  return Product.findAll({
    where: { customerId }
  });
}

/**
 * Obtiene un producto por su ID.
 */
export async function getProductById(id: number) {
  return Product.findByPk(id);
}

/**
 * Actualiza un producto por su ID.
 */
export async function updateProduct(
  id: number,
  dto: UpdateProductDto
) {
  const prod = await Product.findByPk(id);
  if (!prod) throw new Error(`Producto con id=${id} no encontrado`);
  const updates: Partial<UpdateProductDto> = {};
  if (dto.name        !== undefined) updates.name        = dto.name;
  if (dto.description !== undefined) updates.description = dto.description;
  if (dto.price       !== undefined) updates.price       = dto.price;
  if (dto.taxRate     !== undefined) updates.taxRate     = dto.taxRate;
  if (Object.keys(updates).length) {
    await prod.update(updates);
  }
  return prod;
}
