import { Injectable } from "@nestjs/common"
import { Transfer, TransferStatus, type TransferChannel } from "./entities/transfer.entity"
import { randomUUID } from "crypto"

@Injectable()
export class TransfersRepository {
  private transfers: Map<string, Transfer> = new Map()

  create(name: string, amount: number, channel: TransferChannel, reference: string, fees: number): Transfer {
    const transfer = new Transfer()
    transfer.id = randomUUID()
    transfer.reference = reference
    transfer.name = name
    transfer.amount = amount
    transfer.fees = fees
    transfer.channel = channel
    transfer.status = TransferStatus.PENDING
    transfer.created_at = new Date()
    transfer.updated_at = new Date()

    this.transfers.set(transfer.id, transfer)
    return transfer
  }

  findById(id: string): Transfer | undefined {
    return this.transfers.get(id)
  }

  findAll(filters: {
    status?: TransferStatus
    channel?: TransferChannel
    minAmount?: number
    maxAmount?: number
    q?: string
    limit: number
    cursor?: string
  }): { data: Transfer[]; nextCursor?: string } {
    let results = Array.from(this.transfers.values())

    // Apply filters
    if (filters.status) {
      results = results.filter((t) => t.status === filters.status)
    }
    if (filters.channel) {
      results = results.filter((t) => t.channel === filters.channel)
    }
    if (filters.minAmount !== undefined) {
      const minAmount = filters.minAmount
      results = results.filter((t) => t.amount >= minAmount)
    }
    if (filters.maxAmount !== undefined) {
      const maxAmount = filters.maxAmount
      results = results.filter((t) => t.amount <= maxAmount)
    }
    if (filters.q) {
      const query = filters.q
      const queryLower = query.toLowerCase()
      results = results.filter((t) => t.reference.includes(query) || t.name.toLowerCase().includes(queryLower))
    }

    // Sort by created_at descending
    results.sort((a, b) => b.created_at.getTime() - a.created_at.getTime())

    // Handle cursor pagination
    let startIndex = 0
    if (filters.cursor) {
      startIndex = results.findIndex((t) => t.id === filters.cursor) + 1
      if (startIndex === 0) startIndex = 0 // Cursor not found, start from beginning
    }

    const limit = Math.min(filters.limit, 50)
    const data = results.slice(startIndex, startIndex + limit)
    const nextCursor = startIndex + limit < results.length ? data[data.length - 1]?.id : undefined

    return { data, nextCursor }
  }

  update(id: string, partial: Partial<Transfer>): Transfer | undefined {
    const transfer = this.transfers.get(id)
    if (!transfer) return undefined

    Object.assign(transfer, partial, { updated_at: new Date() })
    return transfer
  }
}
