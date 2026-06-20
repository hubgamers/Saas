import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const SCALAR_TYPES = ["string", "number", "boolean", "Date"];
const RELATION_TYPES = ["ManyToOne", "ManyToMany"];
const RESERVED_FIELDS = ["id", "createdAt", "updatedAt"];
const ENUM_KIND = "enum";
const colorEnabled = process.env.NO_COLOR !== "1" && process.env.NO_COLOR !== "true";
const colors = {
  bold: (value) => paint(value, "1"),
  dim: (value) => paint(value, "2"),
  green: (value) => paint(value, "32"),
  yellow: (value) => paint(value, "33"),
  red: (value) => paint(value, "31"),
  cyan: (value) => paint(value, "36"),
};

const args = process.argv.slice(2);
const force = args.includes("--force") || process.env.npm_config_force === "true";
const dryRun =
  args.includes("--dry-run") || process.env.npm_config_dry_run === "true";
const noInteraction =
  args.includes("--no-interaction") ||
  process.env.npm_config_no_interaction === "true";
const positionalArgs = args.filter((arg) => !arg.startsWith("--"));
const npmModuleFlag = process.env.npm_config_module === "true";
const npmEntityFlag = process.env.npm_config_entity === "true";

const folders = [
  "application/dtos",
  "application/use-cases",
  "domain",
  "infrastructure",
  "presentation",
];

class CliError extends Error {
  constructor(message, hints = [], exitCode = 1) {
    super(message);
    this.name = "CliError";
    this.hints = hints;
    this.exitCode = exitCode;
  }
}

await main().catch((error) => {
  if (error instanceof CliError) {
    printError(error.message, error.hints);
    process.exit(error.exitCode);
  }

  console.error(error);
  process.exit(1);
});

async function main() {
  if (args.includes("--help") || args.includes("-h")) {
    printHelp();
    return;
  }

  const { command, rawModuleName, rawFields } = resolveCommand(positionalArgs);

  if (!["module", "entity"].includes(command) || !rawModuleName) {
    printHelp();
    throw new CliError("Commande invalide.");
  }

  const names = buildNames(rawModuleName);
  const basePath = path.join(process.cwd(), "src", "modules", names.moduleName);
  const moduleExists = fs.existsSync(basePath);
  const existingFields = moduleExists ? readExistingFields(names, basePath) : [];
  const fields =
    rawFields.length > 0 || dryRun || noInteraction || !input.isTTY
      ? parseFields(rawFields)
      : await askFields(existingFields);
  const mergedFields = moduleExists ? mergeFields(existingFields, fields) : fields;
  const files = buildFiles(names, mergedFields);
  const existingFiles = files.filter((file) =>
    fs.existsSync(path.join(basePath, file.path)),
  );

  if (dryRun) {
    printSummary(names, basePath, mergedFields, files, existingFiles, {
      existingFields,
      newFields: fields,
      moduleExists,
    });
    return;
  }

  if (moduleExists && fields.length === 0 && !force) {
    throw new CliError(`Le module "${names.moduleName}" existe deja.`, [
      "Ajoute au moins une property.",
      `Exemple: npm run make --module ${names.moduleName} title:string`,
      "Utilise --force uniquement pour regenerer un module vide.",
    ]);
  }

  folders.forEach((folder) => {
    fs.mkdirSync(path.join(basePath, folder), { recursive: true });
  });

  files.forEach((file) => {
    fs.writeFileSync(path.join(basePath, file.path), file.content);
  });

  const message = moduleExists
    ? `Module "${names.moduleName}" mis a jour dans src/modules/${names.moduleName}`
    : `Module "${names.moduleName}" cree dans src/modules/${names.moduleName}`;

  console.log(`${colors.green("OK")} ${message}`);
}

function paint(value, code) {
  return colorEnabled ? `\u001b[${code}m${value}\u001b[0m` : value;
}

function printError(message, hints = []) {
  console.error(`${colors.red("Erreur")} ${message}`);

  hints.forEach((hint) => {
    console.error(`${colors.dim("-")} ${hint}`);
  });
}

function resolveCommand(positionalArgs) {
  const firstArg = positionalArgs[0];

  if (["module", "entity"].includes(firstArg)) {
    return {
      command: firstArg,
      rawModuleName: positionalArgs[1],
      rawFields: positionalArgs.slice(2),
    };
  }

  if (npmModuleFlag || npmEntityFlag) {
    return {
      command: npmEntityFlag ? "entity" : "module",
      rawModuleName: firstArg,
      rawFields: positionalArgs.slice(1),
    };
  }

  return {
    command: firstArg,
    rawModuleName: positionalArgs[1],
    rawFields: positionalArgs.slice(2),
  };
}

async function askFields(existingFields = []) {
  const rl = readline.createInterface({ input, output });
  const fieldNames = new Set(existingFields.map(getFieldName));
  const fieldKeys = new Set(existingFields.map(getFieldKey));

  try {
    const shouldCreateProperties = await askBoolean(
      rl,
      `${colors.cyan("?")} Voulez-vous ajouter des properties ?`,
      true,
    );

    if (!shouldCreateProperties) {
      return [];
    }

    const fields = [];

    while (true) {
      const rawName = await rl.question(
        `${colors.cyan("?")} Nom de la property ${colors.dim("(laisser vide pour terminer)")}: `,
      );
      const name = rawName.trim();

      if (!name) {
        return fields;
      }

      if (!validateInteractiveFieldName(name, fieldNames, fieldKeys)) {
        continue;
      }

      const kind = await askKind(rl);

      if (kind === "scalar") {
        const type = await askScalarType(rl);
        const optional = await askBoolean(
          rl,
          `${colors.cyan("?")} Ce champ est-il optionnel ?`,
          false,
        );
        const field = { kind, name, type, optional };
        fields.push(field);
        fieldNames.add(getFieldName(field));
        fieldKeys.add(getFieldKey(field));
        console.log(
          `${colors.green("+")} Property ajoutee: ${colors.bold(name)}: ${type}${optional ? "?" : ""}`,
        );
        continue;
      }

      if (kind === ENUM_KIND) {
        const values = await askEnumValues(rl);
        const optional = await askBoolean(
          rl,
          `${colors.cyan("?")} Ce champ est-il optionnel ?`,
          false,
        );
        const field = { kind, name, values, optional };
        fields.push(field);
        fieldNames.add(getFieldName(field));
        fieldKeys.add(getFieldKey(field));
        console.log(
          `${colors.green("+")} Enum ajoutee: ${colors.bold(name)}: enum(${values.join(", ")})${optional ? "?" : ""}`,
        );
        continue;
      }

      const relation = await askRelationType(rl);
      const target = await askRelationTarget(rl);
      const optional =
        relation === "ManyToMany"
          ? false
          : await askBoolean(
              rl,
              `${colors.cyan("?")} Cette relation est-elle optionnelle ?`,
              false,
            );

      const field = { kind, name, relation, target, optional };
      if (!validateInteractiveFieldName(name, fieldNames, fieldKeys, field)) {
        continue;
      }
      fields.push(field);
      fieldNames.add(getFieldName(field));
      fieldKeys.add(getFieldKey(field));
      console.log(
        `${colors.green("+")} Relation ajoutee: ${colors.bold(name)}: ${relation}(${target})${optional ? "?" : ""}`,
      );
    }
  } finally {
    rl.close();
  }
}

function validateInteractiveFieldName(name, fieldNames, fieldKeys, field = null) {
  try {
    validateFieldName(name);
    validateNewFieldName(name, fieldNames, fieldKeys, field);
    return true;
  } catch (error) {
    if (error instanceof CliError) {
      printError(error.message, error.hints);
      return false;
    }

    throw error;
  }
}

async function askKind(rl) {
  while (true) {
    const answer = (await rl.question(`${colors.cyan("?")} Type de property: field, enum ou relation [field]: `))
      .trim()
      .toLowerCase();

    if (!answer || ["field", "f", "scalar", "champ"].includes(answer)) {
      return "scalar";
    }

    if (["relation", "r"].includes(answer)) {
      return "relation";
    }

    if (["enum", "e"].includes(answer)) {
      return ENUM_KIND;
    }

    console.log(`${colors.yellow("!")} Reponds par field, enum ou relation.`);
  }
}

async function askScalarType(rl) {
  while (true) {
    const rawType = await rl.question(
      `${colors.cyan("?")} Type (${SCALAR_TYPES.join(", ")}) [string]: `,
    );
    const type = rawType.trim() || "string";

    if (SCALAR_TYPES.includes(type)) {
      return type;
    }

    console.log(`${colors.yellow("!")} Type invalide. Types supportes: ${SCALAR_TYPES.join(", ")}.`);
  }
}

async function askRelationType(rl) {
  while (true) {
    const rawType = await rl.question(
      `${colors.cyan("?")} Relation (${RELATION_TYPES.join(", ")}) [ManyToOne]: `,
    );
    const type = rawType.trim() || "ManyToOne";

    if (RELATION_TYPES.includes(type)) {
      return type;
    }

    console.log(`${colors.yellow("!")} Relation invalide. Relations supportees: ${RELATION_TYPES.join(", ")}.`);
  }
}

async function askRelationTarget(rl) {
  while (true) {
    const target = (await rl.question(`${colors.cyan("?")} Entite cible de la relation: `)).trim();

    if (/^[A-Z][a-zA-Z0-9]*$/.test(target)) {
      return target;
    }

    console.log(`${colors.yellow("!")} Utilise un nom d'entite en PascalCase, par exemple User ou Tag.`);
  }
}

async function askEnumValues(rl) {
  while (true) {
    const rawValues = await rl.question(
      `${colors.cyan("?")} Valeurs enum ${colors.dim("(separees par des virgules)")}: `,
    );

    try {
      return parseEnumValues(rawValues);
    } catch (error) {
      if (error instanceof CliError) {
        printError(error.message, error.hints);
        continue;
      }

      throw error;
    }
  }
}

async function askBoolean(rl, question, defaultValue) {
  const suffix = defaultValue ? "Y/n" : "y/N";

  while (true) {
    const answer = (await rl.question(`${question} [${suffix}] `))
      .trim()
      .toLowerCase();

    if (!answer) {
      return defaultValue;
    }

    if (["y", "yes", "o", "oui"].includes(answer)) {
      return true;
    }

    if (["n", "no", "non"].includes(answer)) {
      return false;
    }

    console.log(`${colors.yellow("!")} Reponds par oui ou non.`);
  }
}

function printSummary(names, basePath, fields, files, existingFiles, context = {}) {
  console.log(colors.bold(`Module ${names.moduleName}`));
  console.log(`${colors.dim("Entite:")} ${names.className}`);
  console.log(`${colors.dim("Chemin:")} ${path.relative(process.cwd(), basePath)}`);

  if (context.moduleExists) {
    console.log(`${colors.dim("Mode:")} ${colors.yellow("mise a jour")}`);
  } else {
    console.log(`${colors.dim("Mode:")} ${colors.green("creation")}`);
  }

  if (context.newFields?.length > 0) {
    console.log(colors.bold("Nouvelles properties"));
    context.newFields.forEach((field) => console.log(`${colors.green("+")} ${formatField(field)}`));
  }

  if (context.existingFields?.length > 0) {
    console.log(colors.bold("Properties existantes conservees"));
    context.existingFields.forEach((field) => console.log(`${colors.dim("-")} ${formatField(field)}`));
  }

  console.log(colors.bold("Champs"));

  if (fields.length === 0) {
    console.log(`${colors.dim("-")} aucun champ metier`);
  } else {
    fields.forEach((field) => console.log(`${colors.cyan("-")} ${formatField(field)}`));
  }

  console.log(colors.bold("Dossiers"));
  folders.forEach((folder) =>
    console.log(`${colors.dim("-")} ${path.join("src/modules", names.moduleName, folder)}`),
  );
  console.log(colors.bold("Fichiers"));
  files.forEach((file) =>
    console.log(`${colors.dim("-")} ${path.join("src/modules", names.moduleName, file.path)}`),
  );

  if (existingFiles.length > 0) {
    console.log(colors.bold("Fichiers deja presents"));
    existingFiles.forEach((file) => console.log(`${colors.yellow("-")} ${file.path}`));
  }
}

function readExistingFields(names, basePath) {
  const entityPath = path.join(
    basePath,
    "domain",
    `${names.singularFileName}.entity.ts`,
  );

  if (!fs.existsSync(entityPath)) {
    return [];
  }

  const content = fs.readFileSync(entityPath, "utf8");
  const match = new RegExp(
    `export type New${names.className} = \\{([\\s\\S]*?)\\};`,
  ).exec(content);

  if (!match) {
    return [];
  }

  return match[1]
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => parseExistingFieldLine(line, content))
    .filter(Boolean);
}

function parseExistingFieldLine(line, entityContent) {
  const match = /^([a-z][a-zA-Z0-9]*)(\?)?: (string\[\]|string|number|boolean|Date|[A-Z][a-zA-Z0-9]*);(?:\s*\/\/\s*@relation\(([A-Z][a-zA-Z0-9]*)\))?$/.exec(
    line,
  );

  if (!match) {
    return null;
  }

  const [, rawName, optionalMarker, type, relationTarget] = match;
  const optional = Boolean(optionalMarker);

  if (type === "string" && rawName.endsWith("Id")) {
    const name = rawName.slice(0, -2);

    return {
      kind: "relation",
      name,
      relation: "ManyToOne",
      target: relationTarget,
      optional,
    };
  }

  if (type === "string[]" && rawName.endsWith("Ids")) {
    const singularName = rawName.slice(0, -3);
    const name = pluralize(singularName);

    return {
      kind: "relation",
      name,
      relation: "ManyToMany",
      target: relationTarget,
      optional: false,
    };
  }

  if (!SCALAR_TYPES.includes(type)) {
    const values = readEnumValues(entityContent, type);

    if (!values) {
      return null;
    }

    return {
      kind: ENUM_KIND,
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

function mergeFields(existingFields, newFields) {
  const merged = [...existingFields];
  const existingNames = new Set(existingFields.map(getFieldKey));

  newFields.forEach((field) => {
    const key = getFieldKey(field);

    if (existingNames.has(key)) {
      throw new CliError(`La property "${field.name}" existe deja.`, [
        "Elle a ete ignoree pour eviter d'ecraser une definition existante.",
        "Utilise un autre nom ou modifie le fichier d'entite manuellement.",
        "Lance --dry-run pour voir les properties conservees.",
      ]);
    }

    existingNames.add(key);
    merged.push(field);
  });

  return merged;
}

function validateNewFieldName(name, fieldNames, fieldKeys, field = null) {
  const key = field ? getFieldKey(field) : name;

  if (fieldNames.has(name) || fieldKeys.has(name) || fieldKeys.has(key)) {
    throw new CliError(`La property "${name}" existe deja.`, [
      "Choisis un autre nom.",
      "L'erreur arrive avant le choix du type pour eviter de saisir une property inutilement.",
      "Lance --dry-run pour voir les properties deja presentes.",
    ]);
  }
}

function getFieldName(field) {
  return field.name;
}

function getFieldKey(field) {
  if (field.kind === "relation" && field.relation === "ManyToOne") {
    return `${field.name}Id`;
  }

  if (field.kind === "relation") {
    return `${singularize(field.name)}Ids`;
  }

  return field.name;
}

function buildNames(input) {
  const moduleName = toKebabCase(input);

  if (!/^[a-z][a-z0-9-]*$/.test(moduleName)) {
    throw new CliError(
      "Nom de module invalide. Utilise un nom comme projects, billing ou support-tickets.",
    );
  }

  const singularFileName = singularize(moduleName);

  return {
    moduleName,
    className: toPascalCase(singularFileName),
    variableName: toCamelCase(singularFileName),
    collectionVariableName: toCamelCase(moduleName),
    singularFileName,
  };
}

function parseFields(rawFields) {
  return rawFields.map((rawField) => {
    const parts = rawField.split(":");
    const [rawName, rawType, rawRelationTarget, extra] = parts;

    if (!rawName || !rawType || extra || parts.length > 3) {
      throw new CliError(
        `Champ invalide "${rawField}". Formats: name:string, customer:ManyToOne:Customer, tags:ManyToMany:Tag.`,
      );
    }

    const optional =
      rawName.endsWith("?") ||
      rawType.endsWith("?") ||
      rawType.endsWith("=optional") ||
      rawRelationTarget?.endsWith("?") ||
      rawRelationTarget?.endsWith("=optional");
    const name = rawName.replace(/\?$/, "");
    const type = rawType.replace(/\?$/, "").replace(/=optional$/, "");
    const relationTarget = rawRelationTarget
      ?.replace(/\?$/, "")
      .replace(/=optional$/, "");

    validateFieldName(name);

    const enumValues = parseEnumType(type, relationTarget);

    if (enumValues) {
      return {
        kind: ENUM_KIND,
        name,
        values: enumValues,
        optional,
      };
    }

    const relation = parseRelationType(type, relationTarget);

    if (relation) {
      return {
        kind: "relation",
        name,
        relation: relation.type,
        target: relation.target,
        optional: relation.type === "ManyToMany" ? false : optional,
      };
    }

    if (!SCALAR_TYPES.includes(type)) {
      throw new CliError(
        `Type invalide "${type}". Types: ${SCALAR_TYPES.join(", ")}, enum. Relations: ManyToOne:Entity, ManyToMany:Entity.`,
      );
    }

    return { kind: "scalar", name, type, optional };
  });
}

function parseEnumType(type, rawValues) {
  if (type.toLowerCase() === ENUM_KIND) {
    if (!rawValues) {
      throw new CliError("Une enum doit declarer ses valeurs.", [
        "Exemple: status:enum:DRAFT,PUBLISHED,ARCHIVED",
      ]);
    }

    return parseEnumValues(rawValues);
  }

  const match = /^enum\((.+)\)$/i.exec(type);

  if (!match) {
    return null;
  }

  return parseEnumValues(match[1]);
}

function parseRelationType(type, rawRelationTarget) {
  if (RELATION_TYPES.includes(type) && rawRelationTarget) {
    if (!/^[A-Z][a-zA-Z0-9]*$/.test(rawRelationTarget)) {
      throw new CliError(
        `Entite cible invalide "${rawRelationTarget}". Utilise un nom comme User ou Tag.`,
      );
    }

    return {
      type,
      target: rawRelationTarget,
    };
  }

  const match = /^(ManyToOne|ManyToMany)\(([A-Z][a-zA-Z0-9]*)\)$/.exec(type);

  if (!match) {
    return null;
  }

  return {
    type: match[1],
    target: match[2],
  };
}

function parseEnumValues(rawValues) {
  const values = String(rawValues)
    .split(",")
    .map(normalizeEnumValue)
    .filter(Boolean);
  const uniqueValues = new Set(values);

  if (values.length === 0) {
    throw new CliError("Une enum doit contenir au moins une valeur.", [
      "Exemple: DRAFT,PUBLISHED,ARCHIVED",
    ]);
  }

  if (uniqueValues.size !== values.length) {
    throw new CliError("Une enum contient des valeurs en doublon.", [
      `Valeurs recues: ${values.join(", ")}`,
    ]);
  }

  return values;
}

function normalizeEnumValue(value) {
  const normalized = value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[\s-]+/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .replace(/_+/g, "_")
    .replace(/(^_|_$)/g, "")
    .toUpperCase();

  if (!normalized) {
    return "";
  }

  if (!/^[A-Z][A-Z0-9_]*$/.test(normalized)) {
    throw new CliError(`Valeur enum invalide "${value}".`, [
      "Utilise des valeurs comme DRAFT, PUBLISHED ou ARCHIVED.",
    ]);
  }

  return normalized;
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

function validateFieldName(name) {
  if (!/^[a-z][a-zA-Z0-9]*$/.test(name)) {
    throw new CliError(`Nom de champ invalide "${name}". Utilise du camelCase.`);
  }

  if (RESERVED_FIELDS.includes(name)) {
    throw new CliError(`Le champ "${name}" est reserve par l'architecture.`);
  }
}

function buildFiles(names, fields) {
  const preparedFields = prepareFields(names, fields);
  const repositoryName = `${names.className}Repository`;
  const repositoryVariableName = `${names.variableName}Repository`;
  const enumTypeNames = getEnumTypeNames(preparedFields);
  const enumValueNames = getEnumValueNames(preparedFields);
  const entityTypeImports = [names.className, ...enumTypeNames].join(", ");
  const entityFields = preparedFields.map((field) => toEntityTypeLine(field)).join("");
  const newEntityFields = preparedFields.map((field) => toNewEntityTypeLine(field)).join("");
  const dtoFields = preparedFields.map((field) => toDtoTypeLine(field)).join("");
  const dtoMapping = preparedFields
    .map((field) => `    ${toDtoMappingLine(names.variableName, field)}\n`)
    .join("");
  const useCaseInputFields = preparedFields.map((field) => toNewEntityTypeLine(field)).join("");
  const useCaseCreateFields = preparedFields
    .map((field) => toUseCaseCreateLine(field))
    .join("");
  const actionFormFields = preparedFields
    .map((field) => `    ${toActionInputLine(field)}\n`)
    .join("");
  const actionHelpers = buildActionHelpers(preparedFields);
  const actionSignature = preparedFields.length > 0 ? "formData: FormData" : "";
  const enumDefinitions = buildEnumDefinitions(preparedFields);
  const useCaseEnumImport =
    enumTypeNames.length > 0
      ? `import type { ${enumTypeNames.join(", ")} } from "../../domain/${names.singularFileName}.entity";\n`
      : "";
  const actionEnumImport =
    enumValueNames.length > 0
      ? `import { ${enumValueNames.join(", ")} } from "../domain/${names.singularFileName}.entity";\n`
      : "";

  return [
    {
      path: `domain/${names.singularFileName}.entity.ts`,
      content: `${usesRelationReference(preparedFields) ? relationReferenceType() : ""}${enumDefinitions}export type ${names.className} = {
  id: string;
${entityFields}  createdAt: Date;
  updatedAt: Date;
};

export type New${names.className} = {
${newEntityFields}};
`,
    },
    {
      path: `domain/${names.singularFileName}.repository.ts`,
      content: `import type { New${names.className}, ${names.className} } from "./${names.singularFileName}.entity";

export interface ${repositoryName} {
  findMany(): Promise<${names.className}[]>;
  create(data: New${names.className}): Promise<${names.className}>;
}
`,
    },
    {
      path: `domain/${names.singularFileName}.rules.ts`,
      content: `export function assertCanCreate${names.className}() {
  return;
}
`,
    },
    {
      path: `application/dtos/${names.singularFileName}.dto.ts`,
      content: `${usesRelationReference(preparedFields) ? dtoRelationReferenceType() : ""}import type { ${entityTypeImports} } from "../../domain/${names.singularFileName}.entity";

export type ${names.className}Dto = {
  id: string;
${dtoFields}  createdAt: string;
};

export function to${names.className}Dto(${names.variableName}: ${names.className}): ${names.className}Dto {
  return {
    id: ${names.variableName}.id,
${dtoMapping}    createdAt: ${names.variableName}.createdAt.toISOString(),
  };
}
`,
    },
    {
      path: `application/use-cases/create-${names.singularFileName}.use-case.ts`,
      content: `import type { ${repositoryName} } from "../../domain/${names.singularFileName}.repository";
${useCaseEnumImport}import { assertCanCreate${names.className} } from "../../domain/${names.singularFileName}.rules";
import { to${names.className}Dto } from "../dtos/${names.singularFileName}.dto";

type Input = {
${useCaseInputFields}  ${repositoryVariableName}: ${repositoryName};
};

export async function create${names.className}UseCase(input: Input) {
  assertCanCreate${names.className}();

  const ${names.variableName} = await input.${repositoryVariableName}.create({
${useCaseCreateFields}  });

  return to${names.className}Dto(${names.variableName});
}
`,
    },
    {
      path: `application/use-cases/list-${names.moduleName}.use-case.ts`,
      content: `import type { ${repositoryName} } from "../../domain/${names.singularFileName}.repository";
import { to${names.className}Dto } from "../dtos/${names.singularFileName}.dto";

type Input = {
  ${repositoryVariableName}: ${repositoryName};
};

export async function list${toPascalCase(names.moduleName)}UseCase(input: Input) {
  const ${names.collectionVariableName} = await input.${repositoryVariableName}.findMany();

  return ${names.collectionVariableName}.map(to${names.className}Dto);
}
`,
    },
    {
      path: `infrastructure/prisma-${names.singularFileName}.repository.ts`,
      content: `import type { ${repositoryName} } from "../domain/${names.singularFileName}.repository";

export const prisma${names.className}Repository: ${repositoryName} = {
  findMany() {
    throw new Error("Implement prisma${names.className}Repository.findMany after adding the Prisma model.");
  },

  create() {
    throw new Error("Implement prisma${names.className}Repository.create after adding the Prisma model.");
  },
};
`,
    },
    {
      path: "presentation/actions.ts",
      content: `"use server";

import { revalidatePath } from "next/cache";
${actionEnumImport}import { create${names.className}UseCase } from "../application/use-cases/create-${names.singularFileName}.use-case";
import { prisma${names.className}Repository } from "../infrastructure/prisma-${names.singularFileName}.repository";

export async function create${names.className}Action(${actionSignature}) {
  await create${names.className}UseCase({
${actionFormFields}    ${repositoryVariableName}: prisma${names.className}Repository,
  });

  revalidatePath("/${names.moduleName}");
}
${actionHelpers}`,
    },
    {
      path: "presentation/queries.ts",
      content: `import { list${toPascalCase(names.moduleName)}UseCase } from "../application/use-cases/list-${names.moduleName}.use-case";
import { prisma${names.className}Repository } from "../infrastructure/prisma-${names.singularFileName}.repository";

export async function get${toPascalCase(names.moduleName)}() {
  return list${toPascalCase(names.moduleName)}UseCase({
    ${repositoryVariableName}: prisma${names.className}Repository,
  });
}
`,
    },
    {
      path: "index.ts",
      content: `export type { ${names.className}Dto } from "./application/dtos/${names.singularFileName}.dto";
export { create${names.className}Action } from "./presentation/actions";
export { get${toPascalCase(names.moduleName)} } from "./presentation/queries";
`,
    },
  ];
}

function usesRelationReference(fields) {
  return fields.some((field) => field.kind === "relation");
}

function relationReferenceType() {
  return `export type RelationReference = {
  id: string;
  label?: string;
};

`;
}

function dtoRelationReferenceType() {
  return `export type RelationReferenceDto = {
  id: string;
  label?: string;
};

`;
}

function prepareFields(names, fields) {
  return fields.map((field) => {
    if (field.kind !== ENUM_KIND) {
      return field;
    }

    return {
      ...field,
      enumName: field.enumName ?? buildEnumName(names, field.name),
    };
  });
}

function buildEnumName(names, fieldName) {
  return `${names.className}${toPascalCase(fieldName)}`;
}

function getEnumTypeNames(fields) {
  return fields
    .filter((field) => field.kind === ENUM_KIND)
    .map((field) => field.enumName);
}

function getEnumValueNames(fields) {
  return getEnumTypeNames(fields).map((enumName) => `${enumName}Values`);
}

function buildEnumDefinitions(fields) {
  return fields
    .filter((field) => field.kind === ENUM_KIND)
    .map((field) => {
      const values = field.values.map((value) => `"${value}"`).join(", ");

      return `export const ${field.enumName}Values = [${values}] as const;
export type ${field.enumName} = (typeof ${field.enumName}Values)[number];

`;
    })
    .join("");
}

function toEntityTypeLine(field) {
  if (field.kind === "scalar") {
    return `  ${field.name}${field.optional ? "?" : ""}: ${field.type};\n`;
  }

  if (field.kind === ENUM_KIND) {
    return `  ${field.name}${field.optional ? "?" : ""}: ${field.enumName};\n`;
  }

  if (field.relation === "ManyToOne") {
    return `  ${field.name}Id${field.optional ? "?" : ""}: string;\n  ${field.name}?: RelationReference;\n`;
  }

  return `  ${singularize(field.name)}Ids: string[];\n  ${field.name}?: RelationReference[];\n`;
}

function toNewEntityTypeLine(field) {
  if (field.kind === "scalar") {
    return `  ${field.name}${field.optional ? "?" : ""}: ${field.type};\n`;
  }

  if (field.kind === ENUM_KIND) {
    return `  ${field.name}${field.optional ? "?" : ""}: ${field.enumName};\n`;
  }

  if (field.relation === "ManyToOne") {
    const relationComment = field.target ? ` // @relation(${field.target})` : "";
    return `  ${field.name}Id${field.optional ? "?" : ""}: string;${relationComment}\n`;
  }

  const relationComment = field.target ? ` // @relation(${field.target})` : "";
  return `  ${singularize(field.name)}Ids: string[];${relationComment}\n`;
}

function toDtoTypeLine(field) {
  if (field.kind === "scalar") {
    const type = field.type === "Date" ? "string" : field.type;
    return `  ${field.name}${field.optional ? "?" : ""}: ${type};\n`;
  }

  if (field.kind === ENUM_KIND) {
    return `  ${field.name}${field.optional ? "?" : ""}: ${field.enumName};\n`;
  }

  if (field.relation === "ManyToOne") {
    return `  ${field.name}Id${field.optional ? "?" : ""}: string;\n  ${field.name}?: RelationReferenceDto;\n`;
  }

  return `  ${singularize(field.name)}Ids: string[];\n  ${field.name}?: RelationReferenceDto[];\n`;
}

function toDtoMappingLine(variableName, field) {
  if (field.kind === "scalar" || field.kind === ENUM_KIND) {
    return `${field.name}: ${toScalarDtoValue(variableName, field)},`;
  }

  if (field.relation === "ManyToOne") {
    return `${field.name}Id: ${variableName}.${field.name}Id,\n    ${field.name}: ${variableName}.${field.name},`;
  }

  return `${singularize(field.name)}Ids: ${variableName}.${singularize(field.name)}Ids,\n    ${field.name}: ${variableName}.${field.name},`;
}

function toScalarDtoValue(variableName, field) {
  const value = `${variableName}.${field.name}`;

  if (field.kind !== "scalar" || field.type !== "Date") {
    return value;
  }

  return field.optional ? `${value}?.toISOString()` : `${value}.toISOString()`;
}

function toUseCaseCreateLine(field) {
  if (field.kind === "scalar" || field.kind === ENUM_KIND) {
    return `    ${field.name}: input.${field.name},\n`;
  }

  if (field.relation === "ManyToOne") {
    return `    ${field.name}Id: input.${field.name}Id,\n`;
  }

  return `    ${singularize(field.name)}Ids: input.${singularize(field.name)}Ids,\n`;
}

function toActionInputLine(field) {
  if (field.kind === ENUM_KIND) {
    const required = field.optional ? "false" : "true";
    return `${field.name}: readEnum(formData, "${field.name}", ${field.enumName}Values, ${required}),`;
  }

  if (field.kind === "scalar") {
    return `${field.name}: ${toFormReader(field)},`;
  }

  if (field.relation === "ManyToOne") {
    return `${field.name}Id: readString(formData, "${field.name}Id", ${field.optional ? "false" : "true"}),`;
  }

  return `${singularize(field.name)}Ids: readStringList(formData, "${singularize(field.name)}Ids"),`;
}

function toFormReader(field) {
  const required = field.optional ? "false" : "true";

  if (field.type === "string") {
    return `readString(formData, "${field.name}", ${required})`;
  }

  if (field.type === "number") {
    return `readNumber(formData, "${field.name}", ${required})`;
  }

  if (field.type === "boolean") {
    return `readBoolean(formData, "${field.name}")`;
  }

  return `readDate(formData, "${field.name}", ${required})`;
}

function buildActionHelpers(fields) {
  const helperTypes = new Set();

  fields.forEach((field) => {
    if (field.kind === "scalar") {
      helperTypes.add(field.type);
      return;
    }

    if (field.kind === ENUM_KIND) {
      helperTypes.add(ENUM_KIND);
      return;
    }

    if (field.relation === "ManyToOne") {
      helperTypes.add("string");
      return;
    }

    helperTypes.add("stringList");
  });

  if (helperTypes.size === 0) {
    return "";
  }

  const helpers = [];

  if (helperTypes.has("string")) {
    helpers.push(`function readString(formData: FormData, key: string, required: true): string;
function readString(formData: FormData, key: string, required: false): string | undefined;
function readString(formData: FormData, key: string, required: boolean) {
  const value = String(formData.get(key) ?? "").trim();

  if (!value && required) {
    throw new Error(\`Le champ \${key} est requis.\`);
  }

  return value || undefined;
}
`);
  }

  if (helperTypes.has("number")) {
    helpers.push(`function readNumber(formData: FormData, key: string, required: true): number;
function readNumber(formData: FormData, key: string, required: false): number | undefined;
function readNumber(formData: FormData, key: string, required: boolean) {
  const value = String(formData.get(key) ?? "").trim();

  if (!value && !required) {
    return undefined;
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    throw new Error(\`Le champ \${key} doit etre un nombre.\`);
  }

  return number;
}
`);
  }

  if (helperTypes.has("boolean")) {
    helpers.push(`function readBoolean(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
}
`);
  }

  if (helperTypes.has("Date")) {
    helpers.push(`function readDate(formData: FormData, key: string, required: true): Date;
function readDate(formData: FormData, key: string, required: false): Date | undefined;
function readDate(formData: FormData, key: string, required: boolean) {
  const value = String(formData.get(key) ?? "").trim();

  if (!value && !required) {
    return undefined;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(\`Le champ \${key} doit etre une date valide.\`);
  }

  return date;
}
`);
  }

  if (helperTypes.has(ENUM_KIND)) {
    helpers.push(`function readEnum<TValues extends readonly string[]>(
  formData: FormData,
  key: string,
  values: TValues,
  required: true,
): TValues[number];
function readEnum<TValues extends readonly string[]>(
  formData: FormData,
  key: string,
  values: TValues,
  required: false,
): TValues[number] | undefined;
function readEnum<TValues extends readonly string[]>(
  formData: FormData,
  key: string,
  values: TValues,
  required: boolean,
) {
  const value = String(formData.get(key) ?? "").trim();

  if (!value && !required) {
    return undefined;
  }

  if (!values.includes(value)) {
    throw new Error(\`Le champ \${key} doit etre une valeur autorisee: \${values.join(", ")}.\`);
  }

  return value;
}
`);
  }

  if (helperTypes.has("stringList")) {
    helpers.push(`function readStringList(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .map((value) => String(value).trim())
    .filter(Boolean);
}
`);
  }

  return `\n${helpers.join("\n")}`;
}

function formatField(field) {
  if (field.kind === "scalar") {
    return `${field.name}: ${field.type}${field.optional ? "?" : ""}`;
  }

  if (field.kind === ENUM_KIND) {
    return `${field.name}: enum(${field.values.join(", ")})${field.optional ? "?" : ""}`;
  }

  return `${field.name}: ${field.relation}(${field.target})${field.optional ? "?" : ""}`;
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

function toCamelCase(value) {
  const pascal = toPascalCase(value);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
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

function printHelp() {
  console.log(`Usage:
  npm run make --module <name>
  npm run make --entity <name>
  npm run make -- module <name> [field:type ...]
  npm run make:module -- <name> [field:type ...]

Interactive:
  npm run make --module invoices
  npm run make --entity support-tickets

Non-interactive:
  npm run make -- module invoices number:string total:number dueAt:Date paid:boolean
  npm run make -- module posts author:ManyToOne:User tags:ManyToMany:Tag
  npm run make -- module articles title:string status:enum:DRAFT,PUBLISHED

Field types:
  string, number, boolean, Date
  enum:VALUE_ONE,VALUE_TWO
  ManyToOne:Entity, ManyToMany:Entity
  Quoted enum(VALUE_ONE,VALUE_TWO) also works.
  Quoted ManyToOne(Entity), ManyToMany(Entity) also work.
  Add =optional to make a scalar, enum or ManyToOne optional.
  Quoted ? syntax also works, e.g. "description:string?".

Options:
  --dry-run          Affiche les fichiers sans les creer
  --force            Ecrase les fichiers generes deja presents
  --no-interaction   Ne pose aucune question
`);
}
