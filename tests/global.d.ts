declare interface ImportMeta {
  env?: { DEV: boolean }
  spec: Record<string, any>,
  number: number,
  expiration: number;
  flag: boolean
}

