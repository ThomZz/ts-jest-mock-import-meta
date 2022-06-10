

export function getUrl(): URL {
  return new URL(import.meta.url);
}

export function getEnv(): any {
  return (import.meta as any).env;
}

export function getNumber(): number {
  return (import.meta as any).number;
}

export function getFlag(): boolean {
  return (import.meta as any).flag;
}