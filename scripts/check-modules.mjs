import fs from "node:fs";
import path from "node:path";

const colorEnabled = process.env.NO_COLOR !== "1" && process.env.NO_COLOR !== "true";
const colors = {
  bold: (value) => paint(value, "1"),
  dim: (value) => paint(value, "2"),
  green: (value) => paint(value, "32"),
  yellow: (value) => paint(value, "33"),
  red: (value) => paint(value, "31"),
  cyan: (value) => paint(value, "36"),
};

const root = process.cwd();
const modulesRoot = path.join(root, "src", "modules");
const generatedStrict = process.argv.includes("--strict-generated");

const modules = fs
  .readdirSync(modulesRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

let errorCount = 0;
let warningCount = 0;
const moduleIssues = new Map();

console.log(colors.bold("Module architecture check"));

for (const moduleName of modules) {
  checkModule(moduleName);
}

if (errorCount > 0) {
  console.log(
    `${colors.red("FAIL")} ${errorCount} erreur(s), ${warningCount} warning(s)`,
  );
  process.exit(1);
}

console.log(
  `${colors.green("OK")} ${modules.length} module(s) verifies, ${warningCount} warning(s)`,
);

function checkModule(moduleName) {
  const modulePath = path.join(modulesRoot, moduleName);
  const names = buildNames(moduleName);
  const expectedFiles = getExpectedFiles(names);
  const missingFiles = expectedFiles.filter(
    (file) => !fs.existsSync(path.join(modulePath, file)),
  );

  console.log(`\n${colors.cyan("›")} ${colors.bold(moduleName)}`);

  if (missingFiles.length > 0) {
    const report = generatedStrict ? error : warning;
    report(
      moduleName,
      generatedStrict ? "module incomplet" : "module custom ou incomplet",
      `Fichiers attendus manquants: ${missingFiles.join(", ")}`,
    );
    return;
  }

  const entityPath = path.join(
    modulePath,
    "domain",
    `${names.singularFileName}.entity.ts`,
  );
  const entityContent = read(entityPath);
  const fields = readNewEntityFields(names, entityContent);

  if (!fields) {
    const report = generatedStrict ? error : warning;
    report(
      moduleName,
      generatedStrict ? "entity invalide" : "module custom",
      `Impossible de lire New${names.className}; le check detaille est ignore.`,
    );
    return;
  }

  const generatedScore = getGeneratedScore(modulePath, names);

  if (generatedScore < 4 && !generatedStrict) {
    warning(
      moduleName,
      "module custom",
      "Structure differente du generateur; lance avec --strict-generated pour forcer les controles.",
    );
    return;
  }

  checkEntity(moduleName, names, entityContent, fields);
  checkRepository(moduleName, names, modulePath);
  checkDto(moduleName, names, modulePath, fields);
  checkUseCases(moduleName, names, modulePath, fields);
  checkPresentation(moduleName, names, modulePath, fields);
  checkIndex(moduleName, names, modulePath);

  if (!hasModuleIssues(moduleName)) {
    console.log(`${colors.green("  OK")} module coherent`);
  }
}

function checkEntity(moduleName, names, entityContent, fields) {
  mustContain(moduleName, "entity", entityContent, `export type ${names.className} =`);
  mustContain(moduleName, "entity", entityContent, `export type New${names.className} =`);

  fields.forEach((field) => {
    if (field.kind === "manyToOne") {
      mustContain(moduleName, "entity relation", entityContent, `${field.name}Id`);
    }

    if (field.kind === "manyToMany") {
      mustContain(moduleName, "entity relation", entityContent, `${field.name}Ids`);
    }

    if (field.kind === "enum") {
      mustContain(moduleName, "entity enum", entityContent, `export const ${field.enumName}Values`);
      mustContain(moduleName, "entity enum", entityContent, `export type ${field.enumName}`);
    }
  });
}

function checkRepository(moduleName, names, modulePath) {
  const repositoryPath = path.join(
    modulePath,
    "domain",
    `${names.singularFileName}.repository.ts`,
  );
  const repositoryContent = read(repositoryPath);

  mustContain(moduleName, "repository", repositoryContent, `interface ${names.className}Repository`);
  mustContain(moduleName, "repository", repositoryContent, "findMany()");
  mustContain(moduleName, "repository", repositoryContent, `create(data: New${names.className})`);
}

function checkDto(moduleName, names, modulePath, fields) {
  const dtoPath = path.join(
    modulePath,
    "application",
    "dtos",
    `${names.singularFileName}.dto.ts`,
  );
  const dtoContent = read(dtoPath);

  mustContain(moduleName, "dto", dtoContent, `export type ${names.className}Dto`);
  mustContain(moduleName, "dto", dtoContent, `to${names.className}Dto`);

  fields.forEach((field) => {
    mustContain(moduleName, "dto field", dtoContent, `${field.outputName}`);
  });
}

function checkUseCases(moduleName, names, modulePath, fields) {
  const createPath = path.join(
    modulePath,
    "application",
    "use-cases",
    `create-${names.singularFileName}.use-case.ts`,
  );
  const listPath = path.join(
    modulePath,
    "application",
    "use-cases",
    `list-${names.moduleName}.use-case.ts`,
  );
  const createContent = read(createPath);
  const listContent = read(listPath);

  mustContain(moduleName, "create use-case", createContent, `create${names.className}UseCase`);
  mustContain(moduleName, "list use-case", listContent, `list${toPascalCase(names.moduleName)}UseCase`);

  fields.forEach((field) => {
    mustContain(moduleName, "create use-case field", createContent, `${field.inputName}: input.${field.inputName}`);
  });
}

function checkPresentation(moduleName, names, modulePath, fields) {
  const actionsPath = path.join(modulePath, "presentation", "actions.ts");
  const queriesPath = path.join(modulePath, "presentation", "queries.ts");
  const actionsContent = read(actionsPath);
  const queriesContent = read(queriesPath);

  mustContain(moduleName, "actions", actionsContent, `"use server"`);
  mustContain(moduleName, "actions", actionsContent, `create${names.className}Action`);
  mustContain(moduleName, "queries", queriesContent, `get${toPascalCase(names.moduleName)}`);

  fields.forEach((field) => {
    if (field.kind === "scalar" || field.kind === "enum" || field.kind === "manyToOne") {
      mustContain(moduleName, "action field", actionsContent, `"${field.inputName}"`);
    }

    if (field.kind === "enum") {
      mustContain(moduleName, "action enum", actionsContent, `${field.enumName}Values`);
      mustContain(moduleName, "action enum", actionsContent, "readEnum");
    }

    if (field.kind === "manyToMany") {
      mustContain(moduleName, "action relation", actionsContent, "readStringList");
    }
  });
}

function checkIndex(moduleName, names, modulePath) {
  const indexPath = path.join(modulePath, "index.ts");
  const indexContent = read(indexPath);

  mustContain(moduleName, "index", indexContent, `${names.className}Dto`);
  mustContain(moduleName, "index", indexContent, `create${names.className}Action`);
  mustContain(moduleName, "index", indexContent, `get${toPascalCase(names.moduleName)}`);
}

function getExpectedFiles(names) {
  return [
    `domain/${names.singularFileName}.entity.ts`,
    `domain/${names.singularFileName}.repository.ts`,
    `domain/${names.singularFileName}.rules.ts`,
    `application/dtos/${names.singularFileName}.dto.ts`,
    `application/use-cases/create-${names.singularFileName}.use-case.ts`,
    `application/use-cases/list-${names.moduleName}.use-case.ts`,
    `infrastructure/prisma-${names.singularFileName}.repository.ts`,
    "presentation/actions.ts",
    "presentation/queries.ts",
    "index.ts",
  ];
}

function getGeneratedScore(modulePath, names) {
  const probes = [
    ["domain", `${names.singularFileName}.repository.ts`, "findMany()"],
    ["presentation", "actions.ts", `revalidatePath("/${names.moduleName}")`],
    ["presentation", "queries.ts", `get${toPascalCase(names.moduleName)}`],
    ["infrastructure", `prisma-${names.singularFileName}.repository.ts`, "Implement prisma"],
  ];

  return probes.filter(([folder, file, pattern]) =>
    read(path.join(modulePath, folder, file)).includes(pattern),
  ).length;
}

function readNewEntityFields(names, entityContent) {
  const match = new RegExp(
    `export type New${names.className} = \\{([\\s\\S]*?)\\};`,
  ).exec(entityContent);

  if (!match) {
    return null;
  }

  return match[1]
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map(parseFieldLine)
    .filter(Boolean);
}

function parseFieldLine(line) {
  const match = /^([a-z][a-zA-Z0-9]*)(\?)?: (string\[\]|string|number|boolean|Date|[A-Z][a-zA-Z0-9]*);(?:\s*\/\/\s*@relation\([A-Z][a-zA-Z0-9]*\))?$/.exec(
    line,
  );

  if (!match) {
    return null;
  }

  const [, rawName, optionalMarker, type] = match;
  const optional = Boolean(optionalMarker);

  if (type === "string" && rawName.endsWith("Id")) {
    const relationName = rawName.slice(0, -2);

    return {
      kind: "manyToOne",
      name: relationName,
      inputName: rawName,
      outputName: rawName,
      optional,
    };
  }

  if (type === "string[]" && rawName.endsWith("Ids")) {
    const relationName = rawName.slice(0, -3);

    return {
      kind: "manyToMany",
      name: relationName,
      inputName: rawName,
      outputName: rawName,
      optional: false,
    };
  }

  if (!["string", "number", "boolean", "Date"].includes(type)) {
    return {
      kind: "enum",
      name: rawName,
      inputName: rawName,
      outputName: rawName,
      enumName: type,
      optional,
    };
  }

  return {
    kind: "scalar",
    name: rawName,
    inputName: rawName,
    outputName: rawName,
    optional,
  };
}

function error(moduleName, section, message) {
  errorCount += 1;
  addIssue(moduleName);
  console.log(`${colors.red("  ERROR")} ${colors.bold(section)}: ${message}`);
}

function warning(moduleName, section, message) {
  warningCount += 1;
  addIssue(moduleName);
  console.log(`${colors.yellow("  WARN")} ${colors.bold(section)}: ${message}`);
}

function mustContain(moduleName, section, content, pattern) {
  if (!content.includes(pattern)) {
    error(moduleName, section, `motif manquant: ${pattern}`);
  }
}

function addIssue(moduleName) {
  moduleIssues.set(moduleName, true);
}

function hasModuleIssues(moduleName) {
  return moduleIssues.has(moduleName);
}

function read(filePath) {
  if (!fs.existsSync(filePath)) {
    return "";
  }

  return fs.readFileSync(filePath, "utf8");
}

function buildNames(input) {
  const moduleName = toKebabCase(input);
  const singularFileName = singularize(moduleName);

  return {
    moduleName,
    className: toPascalCase(singularFileName),
    singularFileName,
  };
}

function toKebabCase(value) {
  return value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function toPascalCase(value) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function singularize(value) {
  if (value.endsWith("ies")) {
    return `${value.slice(0, -3)}y`;
  }

  if (value.endsWith("ses")) {
    return value.slice(0, -2);
  }

  if (value.endsWith("s") && !value.endsWith("ss")) {
    return value.slice(0, -1);
  }

  return value;
}

function paint(value, code) {
  return colorEnabled ? `\u001b[${code}m${value}\u001b[0m` : value;
}
