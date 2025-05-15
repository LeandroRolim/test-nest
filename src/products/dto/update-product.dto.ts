import { PartialType } from '@nestjs/mapped-types'; // Permite que todas as propriedades de CreateProductDto sejam opcionais
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}
