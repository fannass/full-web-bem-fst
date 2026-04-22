import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class BigIntInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        return this.serializeData(data);
      }),
    );
  }

  private serializeData(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    // Date objects must be converted to ISO string before iterating
    if (obj instanceof Date) {
      return obj.toISOString();
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.serializeData(item));
    }

    const serialized = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        if (typeof value === 'bigint') {
          serialized[key] = value.toString();
        } else if (value instanceof Date) {
          serialized[key] = value.toISOString();
        } else if (typeof value === 'object' && value !== null) {
          serialized[key] = this.serializeData(value);
        } else {
          serialized[key] = value;
        }
      }
    }
    return serialized;
  }
}
