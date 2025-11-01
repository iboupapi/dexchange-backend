import { IsOptional, IsEnum, IsNumber, IsString, Min, Max } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { TransferStatus, TransferChannel } from "../entities/transfer.entity"
import { Type } from "class-transformer"

export class ListTransfersQueryDto {
  @ApiProperty({ required: false, enum: TransferStatus })
  @IsOptional()
  @IsEnum(TransferStatus)
  status?: TransferStatus

  @ApiProperty({ required: false, enum: TransferChannel })
  @IsOptional()
  @IsEnum(TransferChannel)
  channel?: TransferChannel

  @ApiProperty({ required: false, example: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minAmount?: number

  @ApiProperty({ required: false, example: 10000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxAmount?: number

  @ApiProperty({ required: false, example: "TRF" })
  @IsOptional()
  @IsString()
  q?: string

  @ApiProperty({ required: false, example: 20, description: "Max 50" })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number = 20

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  cursor?: string
}
