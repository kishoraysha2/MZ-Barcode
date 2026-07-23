import path from 'path';
import fs from 'fs';
import { getSuiteRootPath } from './directories';

export class AppLogger {
  private logDir: string;

  constructor() {
    this.logDir = path.join(getSuiteRootPath(), 'logs');
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private getTodayLogFile(): string {
    const today = new Date().toISOString().split('T')[0];
    return path.join(this.logDir, `mz_suite_${today}.log`);
  }

  private writeLog(level: 'INFO' | 'WARN' | 'ERROR' | 'CRASH', message: string, details?: unknown) {
    const timestamp = new Date().toISOString();
    const formatted = `[${timestamp}] [${level}] ${message} ${details ? JSON.stringify(details) : ''}\n`;

    try {
      fs.appendFileSync(this.getTodayLogFile(), formatted, 'utf-8');
    } catch {
      console.error('Failed to write to daily log file:', formatted);
    }
  }

  info(msg: string, details?: unknown) {
    this.writeLog('INFO', msg, details);
  }

  warn(msg: string, details?: unknown) {
    this.writeLog('WARN', msg, details);
  }

  error(msg: string, details?: unknown) {
    this.writeLog('ERROR', msg, details);
  }

  crash(msg: string, error?: unknown) {
    this.writeLog('CRASH', msg, error);
  }
}

export const logger = new AppLogger();
