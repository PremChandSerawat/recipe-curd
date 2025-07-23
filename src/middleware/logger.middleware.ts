import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

interface RequestWithId extends Request {
  id: string;
  originalBody?: any;
}

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(request: RequestWithId, response: Response, next: NextFunction): void {
    const requestId = uuidv4();
    request.id = requestId;
    
    request.originalBody = { ...request.body };

    this.logBasicRequest(request, requestId);

    const startTime = Date.now();

    response.on('finish', () => {
      const { statusCode } = response;
      const contentLength = response.get('content-length');
      const responseTime = Date.now() - startTime;

      if (statusCode >= 400) {
        this.logErrorResponse(
          request,
          response,
          responseTime,
          contentLength,
          requestId,
        );
      } else {
        this.logSuccessResponse(
          request,
          response,
          responseTime,
          contentLength,
          requestId,
        );
      }
    });

    response.on('error', (error) => {
      this.logger.error(
        `Error processing request ${requestId}: ${error.message}`,
        error.stack,
      );
    });

    next();
  }

  private logBasicRequest(request: RequestWithId, requestId: string): void {
    const { method, originalUrl } = request;
    
    this.logger.log(
      `Incoming Request [${requestId}]:
      Method: ${method}
      URL: ${originalUrl}`,
    );
  }

  private logSuccessResponse(
    request: RequestWithId,
    response: Response,
    responseTime: number,
    contentLength: string | undefined,
    requestId: string,
  ): void {
    const { method, originalUrl } = request;
    const { statusCode } = response;

    this.logger.log(
      `Response [${requestId}]:
      ${method} ${originalUrl} ${statusCode}
      Content-Length: ${contentLength || 0}B
      Processing Time: ${responseTime}ms
      Status: ${this.getStatusMessage(statusCode)}`,
    );
  }

  private logErrorResponse(
    request: RequestWithId,
    response: Response,
    responseTime: number,
    contentLength: string | undefined,
    requestId: string,
  ): void {
    const { method, originalUrl, originalBody, headers } = request;
    const { statusCode } = response;

    const logMessage = `Error Response [${requestId}]:
      ${method} ${originalUrl} ${statusCode}
      Content-Length: ${contentLength || 0}B
      Processing Time: ${responseTime}ms
      Status: ${this.getStatusMessage(statusCode)}
      Headers: ${this.sanitizeHeaders(headers)}
      Request Body: ${this.sanitizeBody(originalBody)}
      Response Headers: ${JSON.stringify(response.getHeaders())}`;

    if (statusCode >= 500) {
      this.logger.error(logMessage);
    } else {
      this.logger.warn(logMessage);
    }
  }

  private sanitizeHeaders(headers: any): string {
    const sanitizedHeaders = { ...headers };

    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
    sensitiveHeaders.forEach((header) => {
      if (sanitizedHeaders[header]) {
        sanitizedHeaders[header] = '[REDACTED]';
      }
    });

    return JSON.stringify(sanitizedHeaders, null, 2);
  }

  private sanitizeBody(body: any): string {
    if (!body) return 'No body';

    const sanitizedBody = { ...body };

    const sensitiveFields = ['password', 'token', 'secret', 'apiKey'];
    this.redactSensitiveInfo(sanitizedBody, sensitiveFields);

    return JSON.stringify(sanitizedBody, null, 2);
  }

  private redactSensitiveInfo(obj: any, sensitiveFields: string[]): void {
    if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach((key) => {
        if (sensitiveFields.includes(key.toLowerCase())) {
          obj[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object') {
          this.redactSensitiveInfo(obj[key], sensitiveFields);
        }
      });
    }
  }

  private getStatusMessage(statusCode: number): string {
    const statusMessages: { [key: number]: string } = {
      200: 'OK',
      201: 'Created',
      204: 'No Content',
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      422: 'Unprocessable Entity',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
    };

    return statusMessages[statusCode] || `Unknown Status (${statusCode})`;
  }
}
