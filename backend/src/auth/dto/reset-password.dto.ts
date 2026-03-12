import { IsString, MinLength, Matches } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  oobCode: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[+\-=!@#$%^&*()])/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (e.g., +=-!@#$%^&*())',
  })
  newPassword: string;
}
