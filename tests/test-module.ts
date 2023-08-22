export function getUrl(): URL {
  return new URL(import.meta.url);
}

export function getEnv(): any {
  return import.meta.env;
}

export function getSpec(): any {
  return import.meta.spec;
}

export function getNumber(): number {
  return import.meta.number;
}

export function getExpiration(): number {
  return import.meta.expiration;
}

export function getFlag(): boolean {
  return import.meta.flag;
}