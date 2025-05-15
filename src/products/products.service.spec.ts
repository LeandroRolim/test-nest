import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { Product } from '@prisma/client'; // Import OrderStatus
import { CreateProductDto } from './dto/create-product.dto';

const mockPrismaService = {
  product: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const mockProduct: Product = {
  id: 'test-uuid-product',
  name: 'Test Product',
  category: 'Test Category',
  description: 'Test Description',
  price: 100,
  stock_quantity: 10,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Teste 1: Criar um produto com sucesso
  describe('create', () => {
    it('should create a new product successfully', async () => {
      const createDto: CreateProductDto = {
        name: 'New Product',
        category: 'New Category',
        description: 'New Description',
        price: 150,
        stock_quantity: 20,
      };
      const expectedProduct: Product = {
        ...mockProduct,
        ...createDto,
        id: 'new-product-id',
      };

      prisma.product.create.mockResolvedValue(expectedProduct); // Simula a criação no DB

      const result = await service.create(createDto);

      expect(prisma.product.create).toHaveBeenCalledWith({ data: createDto });
      expect(result).toEqual(expectedProduct);
    });
  });

  // Teste 2: Encontrar um produto pelo ID
  describe('findOne', () => {
    it('should return a product if found', async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct);

      const result = await service.findOne(mockProduct.id);

      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: mockProduct.id },
      });
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException if product is not found', async () => {
      prisma.product.findUnique.mockResolvedValue(null); // Simula produto não encontrado

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
      });
    });
  });

  // Deletar um produto
  describe('remove', () => {
    it('should remove a product successfully', async () => {
      prisma.product.delete.mockResolvedValue(mockProduct);

      const result = await service.remove(mockProduct.id);

      expect(prisma.product.delete).toHaveBeenCalledWith({
        where: { id: mockProduct.id },
      });
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException if product to delete is not found (Prisma P2025 error)', async () => {
      const prismaError = { code: 'P2025' }; // Simula erro P2025 do Prisma
      prisma.product.delete.mockRejectedValue(prismaError);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.product.delete).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
      });
    });
  });
});
