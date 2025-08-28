import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ValidationPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CompaniesService_T1_004 } from './companies.service_T1.004';
import { CreateCompanyDto_T1_004 } from './dto/create-company.dto_T1.004';
import { UpdateCompanyDto_T1_004 } from './dto/update-company.dto_T1.004';

@Controller('companies')
export class CompaniesController_T1_004 {
  constructor(private readonly companiesService: CompaniesService_T1_004) {}

  /**
   * Create a new company
   * POST /companies
   */
  @Post()
  create(@Body(ValidationPipe) createCompanyDto: CreateCompanyDto_T1_004) {
    return this.companiesService.create(createCompanyDto);
  }

  /**
   * Get all companies with pagination
   * GET /companies?page=1&limit=10
   */
  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    const skip = (pageNumber - 1) * limitNumber;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { cnpj: { contains: search, mode: 'insensitive' as const } },
            { contactEmail: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : undefined;

    return this.companiesService.findAll({
      skip,
      take: limitNumber,
      where,
    });
  }

  /**
   * Get company statistics
   * GET /companies/:id/stats
   */
  @Get(':id/stats')
  getStats(@Param('id', ParseUUIDPipe) id: string) {
    return this.companiesService.getStats(id);
  }

  /**
   * Get company by CNPJ
   * GET /companies/cnpj/:cnpj
   */
  @Get('cnpj/:cnpj')
  findByCnpj(@Param('cnpj') cnpj: string) {
    return this.companiesService.findByCnpj(cnpj);
  }

  /**
   * Get company by ID
   * GET /companies/:id
   */
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.companiesService.findOne(id);
  }

  /**
   * Update company
   * PATCH /companies/:id
   */
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateCompanyDto: UpdateCompanyDto_T1_004,
  ) {
    return this.companiesService.update(id, updateCompanyDto);
  }

  /**
   * Delete company
   * DELETE /companies/:id
   */
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.companiesService.remove(id);
  }
}
