import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ValidationPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UsersService_T1_004 } from './users.service_T1.004';
import { CreateUserDto_T1_004 } from './dto/create-user.dto_T1.004';
import { UpdateUserDto_T1_004 } from './dto/update-user.dto_T1.004';

@Controller('users')
export class UsersController_T1_004 {
  constructor(private readonly usersService: UsersService_T1_004) {}

  /**
   * Create a new user
   * POST /users
   */
  @Post()
  create(@Body(ValidationPipe) createUserDto: CreateUserDto_T1_004) {
    return this.usersService.create(createUserDto);
  }

  /**
   * Get all users with pagination
   * GET /users?page=1&limit=10
   */
  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('companyId') companyId?: string,
    @Query('role') role?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    const skip = (pageNumber - 1) * limitNumber;

    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (role) where.role = role;

    return this.usersService.findAll({
      skip,
      take: limitNumber,
      where,
    });
  }

  /**
   * Get users by company
   * GET /users/company/:companyId
   */
  @Get('company/:companyId')
  findByCompany(@Param('companyId', ParseUUIDPipe) companyId: string) {
    return this.usersService.findByCompany(companyId);
  }

  /**
   * Get user statistics by company
   * GET /users/stats/:companyId
   */
  @Get('stats/:companyId')
  getStatsByCompany(@Param('companyId', ParseUUIDPipe) companyId: string) {
    return this.usersService.getStatsByCompany(companyId);
  }

  /**
   * Get user by email
   * GET /users/email/:email
   */
  @Get('email/:email')
  findByEmail(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  /**
   * Get user by ID
   * GET /users/:id
   */
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  /**
   * Update user
   * PATCH /users/:id
   */
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto_T1_004,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  /**
   * Delete user
   * DELETE /users/:id
   */
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }
}
