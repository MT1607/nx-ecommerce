import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '../../prisma/client/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PostgresExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let message = 'Database error';
    let status = HttpStatus.BAD_REQUEST;

    // 💡 Prisma error codes: https://www.prisma.io/docs/reference/api-reference/error-reference
    switch (exception.code) {
      case 'P2002': // unique constraint
        message = `Unique constraint failed on field: ${exception.meta?.target}`;
        status = HttpStatus.CONFLICT; // 409
        break;

      case 'P2003': // foreign key constraint
        message = `Foreign key constraint failed`;
        status = HttpStatus.BAD_REQUEST;
        break;

      case 'P2025': // record not found
        message = `Record not found`;
        status = HttpStatus.NOT_FOUND;
        break;

      default:
        message = exception.message;
        status = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    response.status(status).json({
      message,
      data: null,
      status,
    });
  }
}
