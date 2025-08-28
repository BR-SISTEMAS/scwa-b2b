import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service_T1.002';
import { CreateCompanyDto_T1_004 } from './dto/create-company.dto_T1.004';
import { UpdateCompanyDto_T1_004 } from './dto/update-company.dto_T1.004';
import { Company, Prisma } from '@prisma/client';

@Injectable()
export class CompaniesService_T1_004 {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new company
   * @param createCompanyDto Company creation data
   * @returns Created company
   */
  async create(createCompanyDto: CreateCompanyDto_T1_004): Promise<Company> {
    // Check if CNPJ already exists
    const existingCompany = await this.prisma.company.findUnique({
      where: { cnpj: createCompanyDto.cnpj },
    });

    if (existingCompany) {
      throw new ConflictException('CNPJ already registered');
    }

    // Create company
    return this.prisma.company.create({
      data: createCompanyDto,
    });
  }

  /**
   * Find all companies with optional filters
   * @param params Query parameters for filtering and pagination
   * @returns List of companies
   */
  async findAll(params?: {
    skip?: number;
    take?: number;
    where?: Prisma.CompanyWhereInput;
    orderBy?: Prisma.CompanyOrderByWithRelationInput;
  }) {
    const { skip = 0, take = 10, where, orderBy } = params || {};

    const [companies, total] = await Promise.all([
      this.prisma.company.findMany({
        skip,
        take,
        where,
        orderBy: orderBy || { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              users: true,
              conversations: true,
            },
          },
        },
      }),
      this.prisma.company.count({ where }),
    ]);

    return {
      data: companies,
      meta: {
        total,
        page: Math.floor(skip / take) + 1,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  /**
   * Find a single company by ID
   * @param id Company ID
   * @returns Company details with user count
   */
  async findOne(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            conversations: true,
          },
        },
      },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    return company;
  }

  /**
   * Find a company by CNPJ
   * @param cnpj Company CNPJ
   * @returns Company details
   */
  async findByCnpj(cnpj: string) {
    const company = await this.prisma.company.findUnique({
      where: { cnpj },
      include: {
        _count: {
          select: {
            users: true,
            conversations: true,
          },
        },
      },
    });

    if (!company) {
      throw new NotFoundException(`Company with CNPJ ${cnpj} not found`);
    }

    return company;
  }

  /**
   * Update a company
   * @param id Company ID
   * @param updateCompanyDto Update data
   * @returns Updated company
   */
  async update(id: string, updateCompanyDto: UpdateCompanyDto_T1_004) {
    // Check if company exists
    const existingCompany = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!existingCompany) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    // Update company
    return this.prisma.company.update({
      where: { id },
      data: updateCompanyDto,
      include: {
        _count: {
          select: {
            users: true,
            conversations: true,
          },
        },
      },
    });
  }

  /**
   * Remove a company
   * Note: This will fail if company has users or conversations (FK constraint)
   * @param id Company ID
   * @returns Deletion confirmation
   */
  async remove(id: string) {
    // Check if company exists
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            conversations: true,
          },
        },
      },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    // Check if company has dependencies
    if (company._count.users > 0) {
      throw new ConflictException(
        `Cannot delete company with ${company._count.users} users. Remove users first.`,
      );
    }

    if (company._count.conversations > 0) {
      throw new ConflictException(
        `Cannot delete company with ${company._count.conversations} conversations.`,
      );
    }

    // Delete company
    await this.prisma.company.delete({
      where: { id },
    });

    return {
      message: `Company ${company.name} has been removed`,
      id,
    };
  }

  /**
   * Get company statistics
   * @param id Company ID
   * @returns Company statistics
   */
  async getStats(id: string) {
    // Check if company exists
    const company = await this.findOne(id);

    // Get detailed statistics
    const [
      usersByRole,
      activeConversations,
      totalConversations,
      totalMessages,
    ] = await Promise.all([
      // Users grouped by role
      this.prisma.user.groupBy({
        by: ['role'],
        where: { companyId: id },
        _count: {
          role: true,
        },
      }),
      // Active conversations count
      this.prisma.conversation.count({
        where: {
          companyId: id,
          status: { in: ['open', 'waiting', 'assigned'] },
        },
      }),
      // Total conversations
      this.prisma.conversation.count({
        where: { companyId: id },
      }),
      // Total messages in company conversations
      this.prisma.message.count({
        where: {
          conversation: {
            companyId: id,
          },
        },
      }),
    ]);

    return {
      company: {
        id: company.id,
        name: company.name,
        cnpj: company.cnpj,
      },
      users: {
        total: company._count.users,
        byRole: usersByRole.reduce((acc, item) => {
          acc[item.role] = item._count.role;
          return acc;
        }, {} as Record<string, number>),
      },
      conversations: {
        total: totalConversations,
        active: activeConversations,
      },
      messages: {
        total: totalMessages,
      },
    };
  }
}
