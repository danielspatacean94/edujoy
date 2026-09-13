import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'A apărut o eroare internă. Încearcă din nou mai târziu.';

    const stack = exception instanceof Error ? exception.stack : undefined;

    this.logger.debug(
      `${req.method} ${req.url} → ${status}`,
      stack,
      `${req.method} ${req.url}`,
    );

    const defaultMessages: Record<number, string> = {
      400: 'Cererea este invalidă.',
      401: 'Autentifică-te pentru a continua.',
      403: 'Nu ai permisiunea de a efectua această acțiune.',
      404: 'Resursa solicitată nu a fost găsită.',
      429: 'Prea multe cereri. Încearcă din nou peste un minut.',
    };
    const payload = typeof message === 'object' && message !== null
      ? { ...message } as Record<string, unknown>
      : { statusCode: status, message };
    if (typeof payload.message === 'string' &&
        (/^(Unauthorized|Forbidden resource|Forbidden|Not Found|Bad Request|ThrottlerException|Cannot (GET|POST|PUT|PATCH|DELETE))/.test(payload.message))) {
      payload.message = defaultMessages[status] ?? 'Cererea nu a putut fi procesată.';
    }
    if (typeof payload.error === 'string') payload.error = defaultMessages[status] ?? 'Eroare';
    res.status(status).json(payload);
  }
}
