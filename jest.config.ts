import type { AstTransformer, JestConfigWithTsJest } from 'ts-jest';
import { Options } from "./index";
import { basename } from "path";

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
      flag: false,
      // NOTE: for resolve only static conversions based on source code filename are supported for now.
      resolve: () => {
        switch(basename(fileName)) {
          case "test-module.ts":
            return "https://www.mydummyurl.com/my.jpg";
          default:
            return "";
        }
      },
      // NOTE: not supported:
      // resolve: () => (moduleName: string)=>`https://www.mydummyurl.com/${moduleName.split("/").pop()}`,
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
