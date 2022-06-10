import type { AstTransformer, InitialOptionsTsJest } from 'ts-jest';
import { Options } from "./index";

const mockImportMetaTransformer: AstTransformer<Options> = {
  path: 'index.ts',
  options: {
    metaObjectReplacement: {
      url: "https://www.mydummyurl.com/",
      env: {
        DEV: true
      },
      number: 333,
      flag: false
    }
  }
}

const config: InitialOptionsTsJest = {
  testMatch: ["**/src/**/*.spec.ts"],
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  globals: {
    'ts-jest': {
        diagnostics: {
            ignoreCodes: [1343]
        },
        astTransformers: {
            before: [mockImportMetaTransformer]
        }
    }
  }
};
export default config;
