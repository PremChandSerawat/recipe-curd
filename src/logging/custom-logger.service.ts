import { Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CustomLogger implements LoggerService {
  private context?: string;
  private logToFile: boolean;
  private logFilePath: string;

  constructor(private configService: ConfigService) {
    this.logToFile = this.configService.get('LOG_TO_FILE', 'false') === 'true';
    this.logFilePath = path.join(process.cwd(), 'logs');

    if (this.logToFile) {
      // Create logs directory if it doesn't exist
      if (!fs.existsSync(this.logFilePath)) {
        fs.mkdirSync(this.logFilePath);
      }
    }
  }

  setContext(context: string) {
    this.context = context;
  }

  private formatMessage(message: any, context?: string): string {
    const timestamp = new Date().toISOString();
    const contextMessage = context || this.context || 'Application';
    return `${timestamp} [${contextMessage}] ${message}`;
  }

  private writeToFile(level: string, message: string) {
    if (!this.logToFile) return;

    const date = new Date().toISOString().split('T')[0];
    const logFile = path.join(this.logFilePath, `${date}.log`);
    const logMessage = `${message}\n`;

    fs.appendFileSync(logFile, logMessage);
  }

  log(message: any, context?: string) {
    const formattedMessage = this.formatMessage(message, context);
    console.log(formattedMessage);
    this.writeToFile('INFO', formattedMessage);
  }

  error(message: any, trace?: string, context?: string) {
    const formattedMessage = this.formatMessage(message, context);
    console.error(formattedMessage);
    if (trace) {
      console.error(trace);
      this.writeToFile('ERROR', `${formattedMessage}\n${trace}`);
    } else {
      this.writeToFile('ERROR', formattedMessage);
    }
  }

  warn(message: any, context?: string) {
    const formattedMessage = this.formatMessage(message, context);
    console.warn(formattedMessage);
    this.writeToFile('WARN', formattedMessage);
  }

  debug(message: any, context?: string) {
    const formattedMessage = this.formatMessage(message, context);
    console.debug(formattedMessage);
    this.writeToFile('DEBUG', formattedMessage);
  }

  verbose(message: any, context?: string) {
    const formattedMessage = this.formatMessage(message, context);
    console.info(formattedMessage);
    this.writeToFile('VERBOSE', formattedMessage);
  }
}
