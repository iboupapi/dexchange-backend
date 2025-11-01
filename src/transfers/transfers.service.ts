import { Injectable, ConflictException, NotFoundException } from "@nestjs/common"
import { TransfersRepository } from "./transfers.repository"
import { ProviderSimulator } from "./provider.similator"
import { AuditService } from "../audit/audit.service"
import { type Transfer, TransferStatus } from "./entities/transfer.entity"
import type { CreateTransferDto } from "./dto/create-transfer.dto"
import type { ListTransfersQueryDto } from "./dto/list-transfers.dto"

@Injectable()
export class TransfersService {
  constructor(
    private repository: TransfersRepository,
    private providerSimulator: ProviderSimulator,
    private auditService: AuditService,
  ) {}

  private generateReference(): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")
    const random = Math.random().toString(36).substr(2, 4).toUpperCase()
    return `TRF-${year}${month}${day}-${random}`
  }

  private calculateFees(amount: number): number {
    return Math.ceil(amount * 0.01)
  }

  create(dto: CreateTransferDto): Transfer {
    const reference = this.generateReference()
    const fees = this.calculateFees(dto.amount)

    const transfer = this.repository.create(dto.name, dto.amount, dto.channel, reference, fees)

    this.auditService.log("TRANSFER_CREATED", {
      transfer_id: transfer.id,
      reference: transfer.reference,
      amount: transfer.amount,
      channel: transfer.channel,
    })

    return transfer
  }

  findAll(query: ListTransfersQueryDto) {
    const { data, nextCursor } = this.repository.findAll({
      status: query.status,
      channel: query.channel,
      minAmount: query.minAmount,
      maxAmount: query.maxAmount,
      q: query.q,
      limit: query.limit || 20,
      cursor: query.cursor,
    })

    return { data, nextCursor }
  }

  findById(id: string): Transfer {
    const transfer = this.repository.findById(id)
    if (!transfer) {
      throw new NotFoundException(`Transfer ${id} not found`)
    }
    return transfer
  }

  async process(id: string): Promise<Transfer> {
    const transfer = this.findById(id)

    if (transfer.status !== TransferStatus.PENDING) {
      throw new ConflictException(`Cannot process transfer with status ${transfer.status}`)
    }

    // Update to PROCESSING
    this.repository.update(id, { status: TransferStatus.PROCESSING })

    this.auditService.log("TRANSFER_PROCESSING", {
      transfer_id: id,
      reference: transfer.reference,
    })

    // Simulate provider processing
    const result = await this.providerSimulator.processTransfer()

    if (result.success) {
      const updated = this.repository.update(id, {
        status: TransferStatus.SUCCESS,
        provider_ref: result.provider_ref,
      })

      if (!updated) {
        throw new NotFoundException(`Transfer ${id} not found`)
      }

      this.auditService.log("TRANSFER_SUCCESS", {
        transfer_id: id,
        reference: transfer.reference,
        provider_ref: result.provider_ref,
      })

      return updated
    } else {
      const updated = this.repository.update(id, {
        status: TransferStatus.FAILED,
        error_code: result.error_code,
      })

      if (!updated) {
        throw new NotFoundException(`Transfer ${id} not found`)
      }

      this.auditService.log("TRANSFER_FAILED", {
        transfer_id: id,
        reference: transfer.reference,
        error_code: result.error_code,
      })

      return updated
    }
  }

  cancel(id: string): Transfer {
    const transfer = this.findById(id)

    if (transfer.status !== TransferStatus.PENDING) {
      throw new ConflictException(`Cannot cancel transfer with status ${transfer.status}`)
    }

    const updated = this.repository.update(id, {
      status: TransferStatus.CANCELED,
    })

    if (!updated) {
      throw new NotFoundException(`Transfer ${id} not found`)
    }

    this.auditService.log("TRANSFER_CANCELED", {
      transfer_id: id,
      reference: transfer.reference,
    })

    return updated
  }
}
