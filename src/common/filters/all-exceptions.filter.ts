import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'object' && 'message' in exceptionResponse
          ? (exceptionResponse as any).message
          : exception.message;
    } else if (exception instanceof Error) {
      message = exception.message;
    } else if (exception && typeof exception === 'object' && 'message' in exception) {
      message = String((exception as any).message || message);
    } else if (exception && typeof exception === 'object') {
      try {
        message = JSON.stringify(exception);
      } catch (e) {
        message = String(exception);
      }
    } else if (typeof exception === 'string') {
      message = exception;
    }

    this.logger.error(`[${new Date().toISOString()}] ${message}`, exception);
    // Log request info for debugging unauthorized errors
    try {
      const req = request as any;
      if (req) {
        this.logger.error(`[Request] ${req.method} ${req.url} Authorization: ${req.headers?.authorization}`);
      }
    } catch (e) {
      // ignore
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
