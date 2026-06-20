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

const dryRun = process.argv.includes("--dry-run");
const root = process.cwd();
const modulesRoot = path.join(root, "src", "modules");
const schemaPath = path.join(root, "prisma", "schema.prisma");

const schema = fs.readFileSync(schemaPath, "utf8");
const existingModels = getExistingModels(schema);
const existingEnums = getExistingEnums(schema);
const knownModelNames = getKnownModelNames();
const moduleModels = getModuleModels();
const moduleEnums = getModuleEnums(moduleModels);
const missingModels = moduleModels.filter((model) => !existingModels.has(model.name));
const missingEnums = moduleEnums.filter((enumDef) => !existingEnums.has(enumDef.name));
const missingModelNames = new Set(missingModels.map((model) => model.name));
const inverseRelations = getInverseRelations(missingModels);
const relationWarnings = getRelationWarnings(missingModels);
const skippedRelationWarnings = getSkippedRelationWarnings(missingModels);

console.log(colors.bold("Prisma schema generation"));

if (missingModels.length === 0 && missingEnums.length === 0) {
  console.log(`${colors.green("OK")} Aucun modele ou enum manquant.`);
  process.exit(0);
}

if (missingEnums.length > 0) {
  console.log(`${colors.cyan("›")} Enums a ajouter: ${missingEnums.map((enumDef) => enumDef.name).join(", ")}`);
}

if (missingModels.length > 0) {
  console.log(`${colors.cyan("›")} Modeles a ajouter: ${missingModels.map((model) => model.name).join(", ")}`);
}

relationWarnings.forEach((warning) => {
  console.log(`${colors.yellow("!")} ${warning}`);
});
skippedRelationWarnings.forEach((warning) => {
  console.log(`${colors.yellow("!")} ${warning}`);
});

const generated = [
  ...missingEnums.map(buildEnum),
  ...missingModels.map((model) => buildModel(model.name, model.fields, inverseRelations.get(model.name) ?? [])),
]
  .join("\n\n");

if (dryRun) {
  console.log(colors.bold("\nPreview"));
  console.log(generated);
  process.exit(0);
}

fs.writeFileSync(schemaPath, `${schema.trimEnd()}\n\n${generated}\n`);
console.log(
  `${colors.green("OK")} ${missingModels.length} modele(s), ${missingEnums.length} enum(s) ajoute(s) dans prisma/schema.prisma`,
);
console.log(`${colors.dim("-")} Lance ensuite: npx prisma format && npx prisma generate`);

function getModuleModels() {
  return fs
    .readdirSync(modulesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .map(readModuleModel)
    .filter(Boolean);
}

function readModuleModel(moduleName) {
  const names = buildNames(moduleName);
  const entityPath = path.join(
    modulesRoot,
    moduleName,
    "domain",
    `${names.singularFileName}.entity.ts`,
  );

  if (!fs.existsSync(entityPath)) {
    return null;
  }

  const entity = fs.readFileSync(entityPath, "utf8");
  const newEntityMatch = new RegExp(
    `export type New${names.className} = \\{([\\s\\S]*?)\\};`,
  ).exec(entity);

  if (!newEntityMatch) {
    return null;
  }

  const fields = newEntityMatch[1]
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => parseEntityField(line, entity))
    .filter(Boolean);

  if (fields.length === 0 && isCustomModule(moduleName)) {
    return null;
  }

  return {
    name: names.className,
    fields,
    enums: fields.filter((field) => field.kind === "enum"),
  };
}

function buildModel(modelName, fields, inverses = []) {
  const lines = [
    `model ${modelName} {`,
    "  id        String   @id @default(cuid())",
  ];
  const indexes = [];
  const relationTargetCounts = getRelationTargetCounts(fields);

  fields.forEach((field) => {
    if (field.kind === "scalar") {
      lines.push(`  ${field.name.padEnd(9)} ${toPrismaScalar(field)}`);
      return;
    }

    if (field.kind === "enum") {
      lines.push(`  ${field.name.padEnd(9)} ${field.enumName}${field.optional ? "?" : ""}`);
      return;
    }

    if (field.kind === "manyToOne") {
      const target = resolveRelationTarget(field.target);
      if (!target) {
        lines.push(`  ${`${field.name}Id`.padEnd(9)} String${field.optional ? "?" : ""}`);
        indexes.push(`  @@index([${field.name}Id])`);
        return;
      }

      const relationName = relationTargetCounts.get(target) > 1 ? buildRelationName(modelName, field.name) : null;
      const relationArgs = [
        relationName ? `"${relationName}"` : null,
        `fields: [${field.name}Id]`,
        "references: [id]",
      ].filter(Boolean);

      lines.push(`  ${`${field.name}Id`.padEnd(9)} String${field.optional ? "?" : ""}`);
      lines.push(
        `  ${field.name.padEnd(9)} ${target}${field.optional ? "?" : ""} @relation(${relationArgs.join(", ")})`,
      );
      indexes.push(`  @@index([${field.name}Id])`);
      return;
    }

    const target = resolveRelationTarget(field.target);
    if (!target) {
      return;
    }

    const relationName =
      relationTargetCounts.get(target) > 1
        ? buildRelationName(modelName, field.name)
        : null;

    lines.push(
      `  ${field.name.padEnd(9)} ${target}[]${relationName ? ` @relation("${relationName}")` : ""}`,
    );
  });

  inverses.forEach((inverse) => {
    lines.push(`  ${inverse.name.padEnd(9)} ${inverse.type}`);
  });

  lines.push("  createdAt DateTime @default(now())");
  lines.push("  updatedAt DateTime @updatedAt");
  indexes.forEach((index) => lines.push(index));
  lines.push("}");

  return lines.join("\n");
}

function buildEnum(enumDef) {
  return [
    `enum ${enumDef.name} {`,
    ...enumDef.values.map((value) => `  ${value}`),
    "}",
  ].join("\n");
}

function parseEntityField(line, entityContent) {
  const match = /^([a-z][a-zA-Z0-9]*)(\?)?: (string\[\]|string|number|boolean|Date|[A-Z][a-zA-Z0-9]*);(?:\s*\/\/\s*@relation\(([A-Z][a-zA-Z0-9]*)\))?$/.exec(
    line,
  );

  if (!match) {
    return null;
  }

  const [, rawName, optionalMarker, type, relationTarget] = match;
  const optional = Boolean(optionalMarker);

  if (type === "string" && rawName.endsWith("Id")) {
    const relationName = rawName.slice(0, -2);

    return {
      kind: "manyToOne",
      name: relationName,
      target: relationTarget ?? relationName,
      optional,
    };
  }

  if (type === "string[]" && rawName.endsWith("Ids")) {
    const relationName = rawName.slice(0, -3);

    return {
      kind: "manyToMany",
      name: pluralize(relationName),
      target: relationTarget ?? relationName,
      optional: false,
    };
  }

  if (!["string", "number", "boolean", "Date"].includes(type)) {
    const values = readEnumValues(entityContent, type);

    if (!values) {
      return null;
    }

    return {
      kind: "enum",
      name: rawName,
      enumName: type,
      values,
      optional,
    };
  }

  return {
    kind: "scalar",
    name: rawName,
    type,
    optional,
  };
}

function readEnumValues(entityContent, enumName) {
  const match = new RegExp(
    `export const ${enumName}Values = \\[([^\\]]+)\\] as const;`,
  ).exec(entityContent);

  if (!match) {
    return null;
  }

  return [...match[1].matchAll(/"([^"]+)"/g)].map((valueMatch) => valueMatch[1]);
}

function getModuleEnums(models) {
  const enums = models.flatMap((model) => model.enums ?? []);

  return [...new Map(enums.map((enumDef) => [enumDef.enumName, enumDef])).values()].map(
    (enumDef) => ({
      name: enumDef.enumName,
      values: enumDef.values,
    }),
  );
}

function getKnownModelNames() {
  const moduleNames = fs
    .readdirSync(modulesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => buildNames(entry.name).className);

  return new Set([...existingModels, ...moduleNames]);
}

function resolveRelationTarget(target) {
  const pascalTarget = toPascalCase(target);

  if (knownModelNames.has(pascalTarget)) {
    return pascalTarget;
  }

  const singularTarget = toPascalCase(singularize(target));

  if (knownModelNames.has(singularTarget)) {
    return singularTarget;
  }

  const matchingModel = [...knownModelNames].find(
    (modelName) => modelName.toLowerCase() === pascalTarget.toLowerCase(),
  );

  const localizedMatch = [...knownModelNames].find(
    (modelName) => normalizeModelName(modelName) === normalizeModelName(pascalTarget),
  );

  if (localizedMatch) {
    return localizedMatch;
  }

  return matchingModel ?? null;
}

function getInverseRelations(models) {
  const inverses = new Map();

  models.forEach((model) => {
    const relationTargetCounts = getRelationTargetCounts(model.fields);

    model.fields
      .filter((field) => field.kind === "manyToOne" || field.kind === "manyToMany")
      .forEach((field) => {
        const target = resolveRelationTarget(field.target);

        if (!target || !missingModelNames.has(target)) {
          return;
        }

        const existing = inverses.get(target) ?? [];
        const hasMultipleRelationsToTarget = relationTargetCounts.get(target) > 1;
        existing.push({
          name: hasMultipleRelationsToTarget
            ? `${field.name}${pluralize(model.name)}`
            : pluralize(lowerFirst(model.name)),
          type: `${model.name}[]${hasMultipleRelationsToTarget ? ` @relation("${buildRelationName(model.name, field.name)}")` : ""}`,
        });
        inverses.set(target, dedupeInverseRelations(existing));
      });
  });

  return inverses;
}

function getRelationWarnings(models) {
  return models.flatMap((model) =>
    model.fields
      .filter((field) => field.kind === "manyToOne" || field.kind === "manyToMany")
      .map((field) => resolveRelationTarget(field.target))
      .filter((target) => target && existingModels.has(target))
      .map(
        (target) =>
          `Relation vers modele existant ${target}: ajoute le champ inverse manuellement si Prisma le demande.`,
      ),
  );
}

function getSkippedRelationWarnings(models) {
  return models.flatMap((model) =>
    model.fields
      .filter((field) => field.kind === "manyToMany" && !resolveRelationTarget(field.target))
      .map(
        (field) =>
          `Relation ${model.name}.${field.name} ignoree: cible "${field.target}" inconnue. Regenere le module avec ${field.name}:ManyToMany:NomDuModele pour creer une vraie relation Prisma.`,
      ),
  );
}

function dedupeInverseRelations(inverses) {
  return [...new Map(inverses.map((inverse) => [inverse.name, inverse])).values()];
}

function getRelationTargetCounts(fields) {
  const counts = new Map();

  fields
    .filter((field) => field.kind === "manyToOne" || field.kind === "manyToMany")
    .forEach((field) => {
      const target = resolveRelationTarget(field.target);
      if (!target) return;

      counts.set(target, (counts.get(target) ?? 0) + 1);
    });

  return counts;
}

function buildRelationName(modelName, fieldName) {
  return `${modelName}${toPascalCase(fieldName)}`;
}

function normalizeModelName(value) {
  return value.toLowerCase().replace(/y$/, "ie");
}

function toPrismaScalar(field) {
  const optional = field.optional ? "?" : "";

  if (field.type === "string") {
    return `String${optional}`;
  }

  if (field.type === "number") {
    return `Float${optional}`;
  }

  if (field.type === "boolean") {
    return `Boolean${optional}`;
  }

  return `DateTime${optional}`;
}

function getExistingModels(schema) {
  return new Set(
    [...schema.matchAll(/^model\s+([A-Za-z][A-Za-z0-9]*)\s+\{/gm)].map(
      (match) => match[1],
    ),
  );
}

function getExistingEnums(schema) {
  return new Set(
    [...schema.matchAll(/^enum\s+([A-Za-z][A-Za-z0-9]*)\s+\{/gm)].map(
      (match) => match[1],
    ),
  );
}

function isCustomModule(moduleName) {
  return ["billing", "projects"].includes(moduleName);
}

function buildNames(input) {
  const moduleName = toKebabCase(input);
  const singularFileName = singularize(moduleName);

  return {
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

function lowerFirst(value) {
  return value.charAt(0).toLowerCase() + value.slice(1);
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

function pluralize(value) {
  if (value.endsWith("y")) {
    return `${value.slice(0, -1)}ies`;
  }

  if (value.endsWith("s")) {
    return value;
  }

  return `${value}s`;
}

function paint(value, code) {
  return colorEnabled ? `\u001b[${code}m${value}\u001b[0m` : value;
}
