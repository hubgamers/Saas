import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const root = process.cwd();
const outDir = path.join(root, ".prisma-seed");
const generatedSource = path.join(root, "src", "generated", "prisma");
const generatedOut = path.join(outDir, "generated");
const checkOnly = process.argv.includes("--check");

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(generatedOut, { recursive: true });

for (const file of listTsFiles(generatedSource)) {
  const relative = path.relative(generatedSource, file);
  transpileFile(file, path.join(generatedOut, relative.replace(/\.ts$/, ".mjs")));
}

const seedSource = path.join(root, "prisma", "seed.ts");
const seedOut = path.join(outDir, "seed.mjs");
transpileFile(seedSource, seedOut, {
  "../src/generated/prisma/client": "./generated/client.mjs",
});

if (checkOnly) {
  console.log(`Seed compiled to ${path.relative(root, seedOut)}`);
  process.exit(0);
}

await import(pathToFileURL(seedOut).href);

function listTsFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return listTsFiles(absolute);
    }

    return entry.isFile() && entry.name.endsWith(".ts") ? [absolute] : [];
  });
}

function transpileFile(sourcePath, outputPath, aliases = {}) {
  const source = fs.readFileSync(sourcePath, "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
      sourceMap: false,
    },
    fileName: sourcePath,
  }).outputText;
  const rewritten = rewriteRelativeImports(transpiled, aliases);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, rewritten);
}

function rewriteRelativeImports(source, aliases) {
  return source.replace(
    /(from\s+["']|import\s*\(\s*["'])(\.{1,2}\/[^"']+)(["'])/g,
    (match, prefix, specifier, suffix) => {
      const aliased = aliases[specifier] ?? specifier;

      if (aliased.endsWith(".mjs") || path.extname(aliased)) {
        return `${prefix}${aliased}${suffix}`;
      }

      return `${prefix}${aliased}.mjs${suffix}`;
    },
  );
}
