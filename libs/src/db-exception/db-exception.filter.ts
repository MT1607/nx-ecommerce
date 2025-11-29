// Trong thư mục microservice/src/common/filters/db-exception.filter.ts
import {
  Catch,
  RpcExceptionFilter,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { QueryFailedError } from 'typeorm'; // Hoặc thư viện DB bạn dùng
import { RpcException } from '@nestjs/microservices';

@Catch(QueryFailedError) // Bắt các lỗi do DB ném ra
export class DbExceptionFilter implements RpcExceptionFilter<QueryFailedError> {
  catch(exception: QueryFailedError, host: ArgumentsHost): Observable<any> {
    let statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string = 'Database error occurred.';

    const sqlState = (exception as any).code;
    console.log('sql state: ', sqlState);

    switch (sqlState) {
      case '23505': // Unique Violation
        statusCode = HttpStatus.CONFLICT; // 409
        message = 'Data aldready exist.';
        break;
      case '23502': // Not Null Violation
      case '22001': // String Truncation
        statusCode = HttpStatus.BAD_REQUEST; // 400
        message = 'Missing required user fields';
        break;
      case '23503': // Foreign Key Violation
        statusCode = HttpStatus.CONFLICT; // 409
        message = 'conflict with related data.';
        break;
      default:
        break;
    }

    return throwError(
      () =>
        new RpcException({
          statusCode,
          message,
          dbCode: sqlState,
        })
    );
  }
}
