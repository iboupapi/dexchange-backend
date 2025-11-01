import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TransfersModule } from './transfers/transfers.module';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [TransfersModule, AuditModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
