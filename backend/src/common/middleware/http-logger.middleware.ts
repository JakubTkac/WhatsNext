import { Logger } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { STATUS_CODES } from 'node:http';

const logger = new Logger('HTTP');

export function httpLoggerMiddleware(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  const path = request.path;

  if (path.startsWith('/docs')) {
    next();
    return;
  }

  const startedAt = process.hrtime.bigint();
  let logged = false;

  response.once('finish', () => {
    writeRequestLog(
      request.method,
      path,
      response.statusCode,
      startedAt,
      false,
    );
  });

  response.once('close', () => {
    if (!response.writableFinished) {
      writeRequestLog(
        request.method,
        path,
        response.statusCode,
        startedAt,
        true,
      );
    }
  });

  next();

  function writeRequestLog(
    method: string,
    requestPath: string,
    statusCode: number,
    start: bigint,
    aborted: boolean,
  ): void {
    if (logged) {
      return;
    }

    logged = true;
    const durationMs = Math.round(
      Number(process.hrtime.bigint() - start) / 1_000_000,
    );

    if (aborted) {
      logger.warn(`${method} ${requestPath} aborted after ${durationMs}ms`);
      return;
    }

    const statusText = STATUS_CODES[statusCode] ?? 'Unknown status';
    const message = `${method} ${requestPath} ${statusCode} ${statusText} ${durationMs}ms`;

    if (statusCode >= 500) {
      logger.error(message);
    } else if (statusCode >= 400) {
      logger.warn(message);
    } else {
      logger.log(message);
    }
  }
}
