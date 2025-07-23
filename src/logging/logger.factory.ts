import { LoggerService } from '@nestjs/common';

export class LoggerFactory {
  static createLogger(): LoggerService {
    return {
      log(message: any, context?: string) {
        const timestamp = new Date().toISOString();
        console.log(`${timestamp} [${context || 'Application'}] ${message}`);
      },
      error(message: any, trace?: string, context?: string) {
        const timestamp = new Date().toISOString();
        console.error(`${timestamp} [${context || 'Application'}] ${message}`);
        if (trace) {
          console.error(trace);
        }
      },
      warn(message: any, context?: string) {
        const timestamp = new Date().toISOString();
        console.warn(`${timestamp} [${context || 'Application'}] ${message}`);
      },
      debug(message: any, context?: string) {
        const timestamp = new Date().toISOString();
        console.debug(`${timestamp} [${context || 'Application'}] ${message}`);
      },
      verbose(message: any, context?: string) {
        const timestamp = new Date().toISOString();
        console.info(`${timestamp} [${context || 'Application'}] ${message}`);
      },
    };
  }
}
