import { Module } from '@nestjs/common';
import { LoggerMiddleware } from '../middleware/logger.middleware';
import { CustomLogger } from './custom-logger.service';

@Module({
  providers: [LoggerMiddleware, CustomLogger],
  exports: [LoggerMiddleware, CustomLogger],
})
export class LoggingModule {}
