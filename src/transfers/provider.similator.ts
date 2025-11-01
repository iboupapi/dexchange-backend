import { Injectable } from "@nestjs/common"

interface ProviderResult {
  success: boolean
  provider_ref?: string
  error_code?: string
}

@Injectable()
export class ProviderSimulator {
  // Simulates processing with 70% success rate
  async processTransfer(): Promise<ProviderResult> {
    // Wait 2-3 seconds
    const delay = 2000 + Math.random() * 1000
    await new Promise((resolve) => setTimeout(resolve, delay))

    const randomValue = Math.random()
    if (randomValue < 0.7) {
      // 70% success
      return {
        success: true,
        provider_ref: `PROV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      }
    } else {
      // 30% failure
      const errorCodes = ["INSUFFICIENT_FUNDS", "INVALID_ACCOUNT", "NETWORK_ERROR", "TIMEOUT"]
      return {
        success: false,
        error_code: errorCodes[Math.floor(Math.random() * errorCodes.length)],
      }
    }
  }
}
