import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class ProcessRepositoryDto {
  @IsNotEmpty()
  @IsUrl()
  url: string;

  @IsNotEmpty()
  @IsString()
  chatId: string;
}