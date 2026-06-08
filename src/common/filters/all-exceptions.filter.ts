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

    this.logger.error(`[${new Date().toISOString()}] ${message}`, exception instanceof Error ? exception.stack : exception);
    // Log request info for debugging unauthorized errors
    try {
      const req = request as any;
      if (req) {
        this.logger.error(`[Request] ${req.method} ${req.url} Origin: ${req.headers?.origin}`);
      }
    } catch (e) {
      // ignore
    }

    // ================================================================
    // IMPORTANT: Preserve CORS headers before sending the error
    // response. The cors middleware (from enableCors()) sets these
    // on the response, but response.status().json() replaces all
    // headers. We must set them on the response BEFORE json().
    //
    // Without this, the error response will NOT include
    // Access-Control-Allow-Origin, causing the browser to reject
    // the response with a CORS error.
    // ================================================================
    const origin = response.getHeader('Access-Control-Allow-Origin');
    const credentials = response.getHeader('Access-Control-Allow-Credentials');
    const methods = response.getHeader('Access-Control-Allow-Methods');
    const allowHeaders = response.getHeader('Access-Control-Allow-Headers');

    // Set CORS headers FIRST, before sending response body
    if (origin) response.setHeader('Access-Control-Allow-Origin', origin);
    if (credentials) response.setHeader('Access-Control-Allow-Credentials', credentials);
    if (methods) response.setHeader('Access-Control-Allow-Methods', methods);
    if (allowHeaders) response.setHeader('Access-Control-Allow-Headers', allowHeaders);

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}