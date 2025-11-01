export enum TransferStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  CANCELED = "CANCELED",
}

export enum TransferChannel {
  BANK_TRANSFER = "BANK_TRANSFER",
  WALLET = "WALLET",
  CARD = "CARD",
}

export class Transfer {
  id!: string
  reference!: string
  name!: string
  amount!: number
  fees!: number
  channel!: TransferChannel
  status!: TransferStatus
  provider_ref?: string
  error_code?: string
  created_at!: Date
  updated_at!: Date
}
