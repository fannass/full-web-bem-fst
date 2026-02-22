export class BigIntSerializerInterceptor {
  // This handles BigInt serialization in JSON responses
  static serialize(obj: any): any {
    return JSON.parse(
      JSON.stringify(obj, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value,
      ),
    );
  }
}
