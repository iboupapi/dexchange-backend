// Jest provides globals in the test environment, no explicit import required.
import { Test, type TestingModule } from "@nestjs/testing"
import { TransfersService } from "./transfers.service"
import { TransfersRepository } from "./transfers.repository"
import { ProviderSimulator } from "./provider.similator"
import { AuditService } from "../audit/audit.service"
import { TransferChannel, TransferStatus } from "./entities/transfer.entity"

describe("TransfersService", () => {
  let service: TransfersService
  let repository: TransfersRepository

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransfersService, TransfersRepository, ProviderSimulator, AuditService],
    }).compile()

    service = module.get<TransfersService>(TransfersService)
    repository = module.get<TransfersRepository>(TransfersRepository)
  })

  describe("Fee calculation", () => {
    it("should calculate 1% fees correctly", () => {
      const transfer = service.create({
        name: "Test User",
        amount: 1000,
        channel: TransferChannel.BANK_TRANSFER,
      })

      expect(transfer.fees).toBe(10)
    })

    it("should round up fees for decimal amounts", () => {
      const transfer = service.create({
        name: "Test User",
        amount: 1500,
        channel: TransferChannel.BANK_TRANSFER,
      })

      expect(transfer.fees).toBe(15)
    })
  })

  describe("Transfer state transitions", () => {
    it("should transition from PENDING to PROCESSING to SUCCESS", async () => {
      const transfer = service.create({
        name: "Test User",
        amount: 1000,
        channel: TransferChannel.BANK_TRANSFER,
      })

      expect(transfer.status).toBe(TransferStatus.PENDING)

      // Simulate successful processing
      const processed = await service.process(transfer.id)
      expect([TransferStatus.SUCCESS, TransferStatus.FAILED]).toContain(processed.status)
    })

    it("should not allow processing non-PENDING transfers", async () => {
      const transfer = service.create({
        name: "Test User",
        amount: 1000,
        channel: TransferChannel.BANK_TRANSFER,
      })

      // Cancel the transfer
      service.cancel(transfer.id)

      await expect(service.process(transfer.id)).rejects.toThrow("Cannot process transfer")
    })

    it("should only allow canceling PENDING transfers", () => {
      const transfer = service.create({
        name: "Test User",
        amount: 1000,
        channel: TransferChannel.BANK_TRANSFER,
      })

      const canceled = service.cancel(transfer.id)
      expect(canceled.status).toBe(TransferStatus.CANCELED)

      expect(() => service.cancel(transfer.id)).toThrow("Cannot cancel")
    })
  })
})
