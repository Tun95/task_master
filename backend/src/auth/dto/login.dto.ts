import { IsEmail, IsString, IsOptional } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  firebaseToken?: string; // Add this for Firebase ID token

  @IsOptional()
  location_data?: any;
}
