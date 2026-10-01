export function toLower(value: string) {
  return value.trim().toLowerCase();
}

export function lowercaseFields<T extends Record<string, unknown>>(data: T, exclude: (keyof T)[] = []): T {
  const result = { ...data };

  for (const key in result) {
    if (exclude.includes(key)) continue;

    const value = result[key];
    if (typeof value === 'string') {
      result[key] = toLower(value) as T[Extract<keyof T, string>];
    }
  }

  return result;
}
