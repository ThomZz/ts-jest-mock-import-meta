# ts-jest-mock-import-meta AST transformer [![Npm package version](https://badgen.net/npm/v/ts-jest-mock-import-meta)](https://npmjs.com/package/ts-jest-mock-import-meta)

## Install
```bash
npm install -D ts-jest-mock-import-meta
```
>:green_book: This transformer is aimed to be used with [**ts-jest**](https://github.com/kulshekhar/ts-jest)

That moment finally came, where you want to test your esm code that use "import.meta" expressions. (if your are like me, and you do not embrace the TDD approach  :smirk:). You type "jest" in the console, and this infamous error pops up :
````bash
> jest

 FAIL  src/anyfile.spec.ts
  ● Test suite failed to run

    src/anyfile.spec.ts:2:24 - error TS1343: The 'import.meta' meta-property is only allowed when the '--module' option is 'es2020', 'esnext', or 'system'.

    2   const url = new URL('./', import.meta.url) !== undefined;
                             ~~~~~~~~~~~
````
**Worry not !**

Here comes this simple typescript AST transformer to the rescue. 
By using it "before" typescript transpilation, it will simply replace any "import.meta" expressions in typescript files by a mocked object.
"import.meta" expressions are not compatible with *jest*, that by default, works in commonjs, so they need to be stripped down and replaced by a mocked object **before** typescript transpilation is done by *ts-jest*.

 ### Configuration examples (**jest.config**) :
> 📘 See *ts-jest* options documentation for more details about configuration  : https://kulshekhar.github.io/ts-jest/docs/getting-started/options

> ℹ️ Options structure changed since *ts-jest* 29.0.0. Make sure to check the example that corresponds to the version of *ts-jest* you are using.

> ⚠️ **IMPORTANT**: error code 1343 MUST be ignored for the transformer to work.
> https://github.com/Microsoft/TypeScript/blob/main/src/compiler/diagnosticMessages.json#L1035

<details open>
 <summary><h3>ts-jest >= 29.0.0</h3></summary>
 
```javascript
{
  // [...]
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        diagnostics: {
          ignoreCodes: [1343]
        },
        astTransformers: {
          before: [
            {
              path: 'node_modules/ts-jest-mock-import-meta',  // or, alternatively, 'ts-jest-mock-import-meta' directly, without node_modules.
              options: { metaObjectReplacement: { url: 'https://www.url.com' } }
            }
          ]
        }
      }
    ]
  }
}
```
</details>

<details>
 <summary><h3>ts-jest < 29.0.0</h3></summary>

```javascript
{
  // [...]
  globals: {
    'ts-jest': {
      diagnostics: {
        ignoreCodes: [1343]
      },
      astTransformers: {
        before: [
          {
            path: 'node_modules/ts-jest-mock-import-meta',  // or, alternatively, 'ts-jest-mock-import-meta' directly, without node_modules.
            options: { metaObjectReplacement: { url: 'https://www.url.com' } }
          }
        ]
      }
    }
  }
}
```
</details>

## Options

- ### [metaObjectReplacement] (Optional):
  *The mock object or factory function that (the returned value for the latter) will override all "import.meta" expressions. Note that the factory function and all function properties will be called with the replacement context as an argument, and it will always be the returned value that will be used.*

    **[Type]** Record<string, any> or (ctx: ReplacementContext) => Record<string, any>

    ````javascript
    /** @type {ReplacementContext} */
    { 
      fileName: string 
    }
    ````

  **[Default Value]**
  ````javascript
  { url: ({ fileName }) => `file://${fileName}` };
  ````

    **[Example Values]**
    ````javascript
    // An object
    {
      url: 'https://www.url.com',
      env: {
        PROD: false,
        DEV: true
      },
      status: 2,
      file: ({fileName}) => fileName
    }
  ````
  ````javascript
  // A factory function
  ({ fileName }) => ({
    url: fileName,
    env: {
      PROD: false,
      DEV: true
    },
    status: 2
  })
  ````
___

If you found this project helpful, please consider giving it a ⭐! Your support means a lot and helps others discover this repository too.