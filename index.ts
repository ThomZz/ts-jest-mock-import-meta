import type { TsCompilerInstance } from 'ts-jest';
import ts from 'typescript';

export const version = '1.1';

export const name = 'ts-jest-mock-import-meta';

type ReplacementFunctionContext = { fileName: string }
type ReplacementFunction = (context: ReplacementFunctionContext) => Record<string, any>
export interface Options extends Record<string, unknown> {
    readonly metaObjectReplacement: Record<string, any> | ReplacementFunction;
}

const defaultMetaObjectReplacement = {
    url: ({ fileName }) => `file://${fileName}`
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
                    return ts.factory.createObjectLiteralExpression(createImportMetaReplacement(
                        options?.metaObjectReplacement ?? defaultMetaObjectReplacement,
                        { fileName: sourceFile.fileName }
                    ));
                }
                return ts.visitEachChild(node, visitor, context);
            };

            return ts.visitNode(sourceFile, visitor) as ts.SourceFile;
        };
    };
    return transformer;
}

const createPropertyAssignmentValue = (key: string, value: any, context: ReplacementFunctionContext) => {
    let resolvedValue = typeof value === 'function' ? value(context) : value;
    switch(typeof resolvedValue) {
        case "number":
            return ts.factory.createNumericLiteral(resolvedValue);
        case "string":
            if (key === "resolve") {
                return metaResolve(resolvedValue);
            }
            return ts.factory.createStringLiteral(resolvedValue);
        case "boolean":
            return resolvedValue ? ts.factory.createTrue() : ts.factory.createFalse();
        case "object":
            return ts.factory.createObjectLiteralExpression(createImportMetaReplacement(resolvedValue, context));
        default:
            throw new Error(`Property '${key}': value '${resolvedValue}' type '${typeof resolvedValue}' is not supported.`);
    }
};

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import.meta/resolve
function metaResolve(resolvedValue: string): ts.ArrowFunction {
    const parameters = [
        ts.factory.createParameterDeclaration(
          undefined, // modifiers
          undefined, // dotDotDotToken
          ts.factory.createIdentifier("moduleName"), // name
          undefined, // questionToken (optional)
          ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword), // type
          undefined // initializer
        ),
    ];

    // TODO: allow more complex bodies
    const returnStatement = ts.factory.createReturnStatement(
      ts.factory.createStringLiteral(resolvedValue)
    );
    const bodyBlock = ts.factory.createBlock([returnStatement], true);

    return ts.factory.createArrowFunction(
      undefined, // modifiers
      undefined, // type parameters
      parameters, // parameters
      ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword), // return type
      ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken), // `=>` token
      bodyBlock,
    );
}

function createImportMetaReplacement(replacement: Record<string, any>, context: ReplacementFunctionContext): ts.PropertyAssignment[]
function createImportMetaReplacement(replacement: ReplacementFunction, context: ReplacementFunctionContext): ts.PropertyAssignment[]
function createImportMetaReplacement(replacement: Record<string, any> | ReplacementFunction, context: ReplacementFunctionContext): ts.PropertyAssignment[] {
    let replacementObj = typeof replacement === 'object' ? replacement : replacement(context);
    return Object.entries(replacementObj).reduce((previous, [key, value]) => {
        previous.push(ts.factory.createPropertyAssignment(
            ts.factory.createIdentifier(key),
            createPropertyAssignmentValue(key, value, context)
        ));
        return previous;
    }, [] as ts.PropertyAssignment[]);
};
