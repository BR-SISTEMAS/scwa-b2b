import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateCompanyDto_T1_004 } from './create-company.dto_T1.004';

export class UpdateCompanyDto_T1_004 extends PartialType(
  OmitType(CreateCompanyDto_T1_004, ['cnpj'] as const), // CNPJ não deve ser alterado
) {}
