import type { TsCompilerInstance } from 'ts-jest';
import ts from 'typescript';

export const version = '1.0';

export const name = 'ts-jest-mock-import-meta';

export interface Options extends Record<string, unknown> {
    readonly metaObjectReplacement: Record<string, any>;
}

const defaultMetaObjectReplacement = {
    url: __dirname
};

/**
 * **This transformer is aimed to be used with ts-jest**
 *
 * Typescript AST transformer that allow to replace any "import.meta" expressions in typescript files.
 * import.meta expression is not compatible with jest in commonjs, so it needs to be stripped down 
 * and replaced by a mocked object before transpilation.
 *
 * ex (jest.config):
 * ````
 * // ts-jest >= 29.0.0
 * transform: {
 *    '^.+\\.tsx?$': [
 *      'ts-jest',
 *      {
 *        diagnostics: {
 *          ignoreCodes: [1343]
 *        },
 *        astTransformers: {
 *          before: [
 *            {
 *             path: 'node_modules/ts-jest-mock-import-meta',  // or, alternatively, 'ts-jest-mock-import-meta' directly, without node_modules.
 *              options: { metaObjectReplacement: { url: 'https://www.url.com' } }
 *            }
 *          ]
 *        }
 *      }
 *    ]
 * }
 * // ts-jest < 29.0.0
 * globals: {
 *   'ts-jest': {
 *      diagnostics: {
 *        ignoreCodes: [1343]
 *      },
 *      astTransformers: {
 *        before: [
 *          {
 *              path: 'node_modules/ts-jest-mock-import-meta',  // or, alternatively, 'ts-jest-mock-import-meta' directly, without 
 *              options: { metaObjectReplacement: { url: 'anyValidUrl' } }
 *          }
 *        ]
 *      }
 *    }
 * }
 * ````
 * IMPORTANT: error code 1343 MUST be ignored.
 * https://github.com/Microsoft/TypeScript/blob/main/src/compiler/diagnosticMessages.json#L1035
 * @param {TsCompilerInstance} [compiler] ts-jest compiler instance.
 * @param {TransformerOptions} [options] [optional] provide configuration options for the transformer.
 * @returns {ts.TransformerFactory<ts.SourceFile>} The updated typescript source file
 */
export function factory(compiler: TsCompilerInstance, options?: Options): ts.TransformerFactory<ts.SourceFile> {
    const isImportMeta = (node: ts.Node) =>
        ts.isMetaProperty(node) && node.keywordToken === ts.SyntaxKind.ImportKeyword && node.name.text === 'meta';
    const transformer: ts.TransformerFactory<ts.SourceFile> = context => {
        return sourceFile => {
            const visitor = (node: ts.Node): ts.Node => {
                if (isImportMeta(node)) {
                    return ts.factory.createObjectLiteralExpression(createImportMetaReplacement(options?.metaObjectReplacement ?? defaultMetaObjectReplacement));
                }
                return ts.visitEachChild(node, visitor, context);
            };

            return ts.visitNode(sourceFile, visitor);
        };
    };
    return transformer;
}

const createPropertyAssignmentValue = (key: string, value: any) => {
    switch(typeof value) {
        case "number":
            return ts.factory.createNumericLiteral(value);
        case "string":
            return ts.factory.createStringLiteral(value);
        case "boolean":
            return value ? ts.factory.createTrue() : ts.factory.createFalse();
        case "object":
            return ts.factory.createObjectLiteralExpression(createImportMetaReplacement(value));
        default:
            throw new Error(`Property '${key}': value '${value}' type '${typeof value}' is not supported.`);
    }
};

const createImportMetaReplacement = (replacementObj: Record<string, any>) => {
    return Object.entries(replacementObj).reduce((previous, [key, value]) => {
        previous.push(ts.factory.createPropertyAssignment(
            ts.factory.createIdentifier(key),
            createPropertyAssignmentValue(key, value)
        ));
        return previous;
    }, [] as ts.PropertyAssignment[]);
};
