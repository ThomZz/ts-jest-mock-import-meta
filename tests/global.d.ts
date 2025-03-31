declare interface ImportMeta {
  env?: { DEV: boolean };
  fileName: string;
  spec: Record<string, any>;
  number: number;
  expiration: number;
  flag: boolean;
  resolve: (moduleName: string) => string;
}
