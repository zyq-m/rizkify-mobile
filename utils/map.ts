function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

function mapKeys(obj: any, transform: (key: string) => string): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map((item) => mapKeys(item, transform));
  if (typeof obj === 'object' && !(obj instanceof Date)) {
    const result: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      result[transform(key)] = mapKeys(obj[key], transform);
    }
    return result;
  }
  return obj;
}

export function toCamelCase<T>(obj: any): T {
  return mapKeys(obj, snakeToCamel) as T;
}
