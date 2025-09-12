// src/repository/dto/repository-url.dto.ts
import { IsNotEmpty, IsUrl, Matches } from 'class-validator';

export class RepositoryUrlDto {
  @IsNotEmpty()
  @IsUrl()
  @Matches(/^(https?:\/\/)?(www\.)?github\.com\/[\w-]+\/[\w-]+$/, {
    message: 'URL must be a valid GitHub repository URL',
  })
  url: string;
}