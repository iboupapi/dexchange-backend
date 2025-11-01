import { IsString, IsNumber, IsEnum, Min, MaxLength } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger"
import { TransferChannel } from "../entities/transfer.entity"

export class CreateTransferDto {
  @ApiProperty({ example: "John Doe", description: "Recipient name" })
  @IsString()
  @MaxLength(100)
  name!: string

  @ApiProperty({ example: 1000, description: "Transfer amount in cents" })
  @IsNumber()
  @Min(1)
  amount!: number

  @ApiProperty({
    enum: TransferChannel,
    example: TransferChannel.BANK_TRANSFER,
    description: "Transfer channel",
  })
  @IsEnum(TransferChannel)
  channel!: TransferChannel
}
