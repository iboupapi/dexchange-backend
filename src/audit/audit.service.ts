import { Injectable } from '@nestjs/common';

export interface AuditLog {
  timestamp: Date;
  action: string;
  details: Record<string, any>;
}

@Injectable()
export class AuditService {
  private logs: AuditLog[] = [];

  log(action: string, details: Record<string, any>): void {
    const auditLog: AuditLog = {
      timestamp: new Date(),
      action,
      details,
    };

    this.logs.push(auditLog);
    console.log(`[AUDIT] ${action}:`, details);
  }

  getAllLogs(): AuditLog[] {
    return this.logs;
  }

  getLogsByAction(action: string): AuditLog[] {
    return this.logs.filter((log) => log.action === action);
  }
}
