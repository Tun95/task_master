import {
  IsEmail,
  IsString,
  MinLength,
  Matches,
  IsOptional,
} from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @MinLength(2)
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[+\-=!@#$%^&*()])/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (e.g., +=-!@#$%^&*())',
  })
  password: string;

  @IsOptional()
  location_data?: any;
}
