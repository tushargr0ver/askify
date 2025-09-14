import { IsString, IsOptional, IsEnum } from "class-validator"


export enum ChatType {
    DOCUMENT = "DOCUMENT",
    REPOSITORY = "REPOSITORY"
}

export class CreateChatDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsEnum(ChatType)
    type: ChatType;
}