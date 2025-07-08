import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import url from 'url';

const commands = [
  // Generate the index.d.ts file
  'tsc -p tsconfig.json',
  // Remove types that are supposed to be used internally
  'rm -rf ./dist/src',
  // Re-format the output
  'npx prettier --write "dist/index.d.ts"',
];

execSync(commands.join(' && '));

const typesPath = path.join(
  path.dirname(url.fileURLToPath(import.meta.url)),
  'dist/index.d.ts',
);

// Insert empty line breaks between public declarations
const publicDeclaration = '/**\n * @public';
const typesContent = fs.readFileSync(typesPath, {
  encoding: 'utf-8',
}).replaceAll(publicDeclaration, '\n' + publicDeclaration);

fs.writeFileSync(typesPath, typesContent, 'utf-8');
