import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service_T1.002';
import { AuthService_T1_004 } from '../auth/auth.service_T1.004';
import { CreateUserDto_T1_004 } from './dto/create-user.dto_T1.004';
import { UpdateUserDto_T1_004 } from './dto/update-user.dto_T1.004';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UsersService_T1_004 {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService_T1_004,
  ) {}

  /**
   * Create a new user
   * @param createUserDto User creation data
   * @returns Created user (without password)
   */
  async create(createUserDto: CreateUserDto_T1_004): Promise<Omit<User, 'passwordHash'>> {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Check if company exists
    const company = await this.prisma.company.findUnique({
      where: { id: createUserDto.companyId },
    });

    if (!company) {
      throw new BadRequestException('Company not found');
    }

    // Hash the password
    const passwordHash = await this.authService.hashPassword(createUserDto.password);

    // Create user
    const { password, ...userData } = createUserDto;
    const user = await this.prisma.user.create({
      data: {
        ...userData,
        passwordHash,
      },
      include: {
        company: true,
      },
    });

    // Remove password hash from response
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Find all users with optional filters
   * @param params Query parameters for filtering and pagination
   * @returns List of users
   */
  async findAll(params?: {
    skip?: number;
    take?: number;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }) {
    const { skip = 0, take = 10, where, orderBy } = params || {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take,
        where,
        orderBy: orderBy || { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          profilePhotoUrl: true,
          companyId: true,
          createdAt: true,
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page: Math.floor(skip / take) + 1,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  /**
   * Find users by company ID
   * @param companyId Company ID
   * @returns List of users in the company
   */
  async findByCompany(companyId: string) {
    return this.findAll({
      where: { companyId },
    });
  }

  /**
   * Find a single user by ID
   * @param id User ID
   * @returns User details
   */
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        profilePhotoUrl: true,
        companyId: true,
        createdAt: true,
        company: {
          select: {
            id: true,
            name: true,
            cnpj: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  /**
   * Find a user by email
   * @param email User email
   * @returns User details
   */
  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        company: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Update a user
   * @param id User ID
   * @param updateUserDto Update data
   * @returns Updated user
   */
  async update(id: string, updateUserDto: UpdateUserDto_T1_004) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Prepare update data
    const updateData: any = { ...updateUserDto };

    // Hash password if provided
    if (updateUserDto.password) {
      updateData.passwordHash = await this.authService.hashPassword(updateUserDto.password);
      delete updateData.password;
    }

    // Update user
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        company: true,
      },
    });

    // Remove password hash from response
    const { passwordHash, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  /**
   * Remove a user (soft delete - for LGPD compliance)
   * In production, implement soft delete with a 'deletedAt' field
   * @param id User ID
   * @returns Deletion confirmation
   */
  async remove(id: string) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // In production, implement soft delete
    // For now, we'll do a hard delete
    await this.prisma.user.delete({
      where: { id },
    });

    return { 
      message: `User ${user.email} has been removed`,
      id,
    };
  }

  /**
   * Get user statistics by company
   * @param companyId Company ID
   * @returns User statistics
   */
  async getStatsByCompany(companyId: string) {
    const [totalUsers, roleDistribution] = await Promise.all([
      this.prisma.user.count({
        where: { companyId },
      }),
      this.prisma.user.groupBy({
        by: ['role'],
        where: { companyId },
        _count: {
          role: true,
        },
      }),
    ]);

    return {
      total: totalUsers,
      byRole: roleDistribution.reduce((acc, item) => {
        acc[item.role] = item._count.role;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}
