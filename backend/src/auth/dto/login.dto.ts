import { IsEmail, IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';

export enum UserType {
  CLIENT = 'client',
  AGENT = 'agent',
}

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsEnum(UserType)
  @IsOptional()
  userType?: UserType; // mantido para compatibilidade
}

export class LoginResponseDto {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    companyId: string;
  };
}
