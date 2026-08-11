/**
 * ts-jest AST transformer that rewrites `import.meta.env.X` → `process.env.X`
 * and `import.meta.env` → `process.env`.
 *
 * Jest runs in CJS mode where `import.meta` is a syntax error. This transformer
 * operates at the TypeScript AST level (before emit) so it produces code that
 * works at runtime with `process.env`.
 *
 * Set VITE_* values in jest-setup.ts via `process.env` for test defaults.
 */
const ts = require('typescript');

const name = 'import-meta-env-transformer';
const version = '2';

/**
 * Returns true when `node` is the MetaProperty AST node for `import.meta`.
 */
function isImportMeta(node) {
  return (
    ts.isMetaProperty(node) && node.keywordToken === ts.SyntaxKind.ImportKeyword
  );
}

function factory() {
  return function transformerFactory(ctx) {
    return function transformer(sf) {
      function visit(node) {
        if (ts.isPropertyAccessExpression(node)) {
          const expr = node.expression;

          // import.meta.env.X → process.env.X
          if (
            ts.isPropertyAccessExpression(expr) &&
            isImportMeta(expr.expression) &&
            expr.name.text === 'env'
          ) {
            return ts.factory.createPropertyAccessExpression(
              ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier('process'),
                'env',
              ),
              node.name.text,
            );
          }

          // import.meta.env → process.env
          if (isImportMeta(expr) && node.name.text === 'env') {
            return ts.factory.createPropertyAccessExpression(
              ts.factory.createIdentifier('process'),
              'env',
            );
          }
        }

        return ts.visitEachChild(node, visit, ctx);
      }

      return ts.visitNode(sf, visit);
    };
  };
}

module.exports = { name, version, factory };
