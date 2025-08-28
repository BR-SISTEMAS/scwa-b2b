import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateUserDto_T1_004 } from './create-user.dto_T1.004';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto_T1_004 extends PartialType(
  OmitType(CreateUserDto_T1_004, ['password', 'email', 'companyId'] as const),
) {
  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password?: string;
}
