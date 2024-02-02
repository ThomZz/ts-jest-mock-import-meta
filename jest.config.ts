import type { AstTransformer, JestConfigWithTsJest } from 'ts-jest';
import { Options } from "./index";

const mockImportMetaTransformer: AstTransformer<Options> = {
  path: 'index.ts',
  options: {
    metaObjectReplacement: ({fileName}) => ({
      url: "https://www.mydummyurl.com/",
      fileName,
      env: {
        DEV: true
      },
      spec: () => {
        let descriptor = '';
        for (let i = 0; i < 6; i++) {
          descriptor += 'a';
        }
        return { descriptor }
      },
      number: 333,
      expiration: () => new Date().getTime(),
      flag: false
    })
  }
}

const config: JestConfigWithTsJest = {
  testMatch: ["**/tests/**/*.spec.ts"],
  transform: {
    '^.+\\.ts?$': [
      'ts-jest',
      {
        diagnostics: {
          ignoreCodes: [1343]
        },
        tsconfig: './tests/tsconfig.json',
        astTransformers: {
          before: [
            mockImportMetaTransformer
          ]
        }
      }
    ]
  },
};
export default config;
