import { ApiProperty } from "@nestjs/swagger"
import { type Transfer, TransferStatus, TransferChannel } from "../entities/transfer.entity"

export class TransferDto {
  @ApiProperty()
  id!: string

  @ApiProperty({ example: "TRF-20250131-ABCD" })
  reference!: string

  @ApiProperty()
  name!: string

  @ApiProperty()
  amount!: number

  @ApiProperty()
  fees!: number

  @ApiProperty({ enum: TransferChannel })
  channel!: TransferChannel

  @ApiProperty({ enum: TransferStatus })
  status!: TransferStatus

  @ApiProperty({ required: false })
  provider_ref?: string

  @ApiProperty({ required: false })
  error_code?: string

  @ApiProperty()
  created_at!: Date

  @ApiProperty()
  updated_at!: Date

  static fromEntity(transfer: Transfer): TransferDto {
    const dto = new TransferDto()
    Object.assign(dto, transfer)
    return dto
  }
}
