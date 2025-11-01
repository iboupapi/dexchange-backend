import { Body, Controller, Get, Post, Param, UseGuards, Query } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity } from "@nestjs/swagger"
import { TransfersService } from "./transfers.service"
import { ApiKeyGuard } from "../common/guards/api-key.guard"
import type { CreateTransferDto } from "./dto/create-transfer.dto"
import { TransferDto } from "./dto/transfer.dto"
import type { ListTransfersQueryDto } from "./dto/list-transfers.dto"

@ApiTags("transfers")
@ApiSecurity("api-key")
@UseGuards(ApiKeyGuard)
@Controller("transfers")
export class TransfersController {
  constructor(private transfersService: TransfersService) {}

  @Post()
  @ApiOperation({ summary: "Create a new transfer" })
  @ApiResponse({ status: 201, type: TransferDto })
  create(@Body() createTransferDto: CreateTransferDto): TransferDto {
    const transfer = this.transfersService.create(createTransferDto)
    return TransferDto.fromEntity(transfer)
  }

  @Get()
  @ApiOperation({ summary: 'List transfers with filtering and cursor pagination' })
  @ApiResponse({ status: 200 })
  findAll(@Query() query: ListTransfersQueryDto) {
    const result = this.transfersService.findAll(query);
    return {
      data: result.data.map((t) => TransferDto.fromEntity(t)),
      nextCursor: result.nextCursor,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a transfer by ID' })
  @ApiResponse({ status: 200, type: TransferDto })
  @ApiResponse({ status: 404, description: 'Transfer not found' })
  findById(@Param('id') id: string): TransferDto {
    const transfer = this.transfersService.findById(id);
    return TransferDto.fromEntity(transfer);
  }

  @Post(':id/process')
  @ApiOperation({ summary: 'Process a transfer (simulate provider)' })
  @ApiResponse({ status: 200, type: TransferDto })
  @ApiResponse({ status: 404, description: 'Transfer not found' })
  @ApiResponse({ status: 409, description: 'Invalid transfer status' })
  async process(@Param('id') id: string): Promise<TransferDto> {
    const transfer = await this.transfersService.process(id);
    return TransferDto.fromEntity(transfer);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a pending transfer' })
  @ApiResponse({ status: 200, type: TransferDto })
  @ApiResponse({ status: 404, description: 'Transfer not found' })
  @ApiResponse({ status: 409, description: 'Cannot cancel non-pending transfer' })
  cancel(@Param('id') id: string): TransferDto {
    const transfer = this.transfersService.cancel(id);
    return TransferDto.fromEntity(transfer);
  }
}
