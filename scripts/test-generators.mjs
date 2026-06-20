import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const suffix = Date.now().toString(36);
const tagModule = `generator-test-tags-${suffix}`;
const articleModule = `generator-test-articles-${suffix}`;
const tagClass = buildClassName(tagModule);
const articleClass = buildClassName(articleModule);
const tagPath = modulePath(tagModule);
const articlePath = modulePath(articleModule);

const colorEnabled = process.env.NO_COLOR !== "1" && process.env.NO_COLOR !== "true";
const colors = {
  bold: (value) => paint(value, "1"),
  green: (value) => paint(value, "32"),
  red: (value) => paint(value, "31"),
  cyan: (value) => paint(value, "36"),
  dim: (value) => paint(value, "2"),
};

await main().catch((error) => {
  console.error(`${colors.red("FAIL")} ${error.message}`);
  process.exit(1);
});

async function main() {
  console.log(colors.bold("Generator integration test"));

  ensureTempModuleDoesNotExist(tagPath);
  ensureTempModuleDoesNotExist(articlePath);

  try {
    step("Create relation target module");
    runNode("scripts/make-modules.mjs", [
      "module",
      tagModule,
      "label:string",
      "kind:enum:PRIMARY,SECONDARY",
      "--force",
      "--no-interaction",
    ]);

    step("Create module with scalars, enum, ManyToOne and ManyToMany");
    runNode("scripts/make-modules.mjs", [
      "module",
      articleModule,
      "title:string",
      "status:enum:DRAFT,PUBLISHED,ARCHIVED",
      "views:number",
      "featured:boolean",
      "publishedAt:Date=optional",
      `tagRef:ManyToOne:${tagClass}`,
      `tagRefs:ManyToMany:${tagClass}`,
      "--force",
      "--no-interaction",
    ]);

    assertGeneratedArticle();
    assertGeneratedTag();

    step("Update existing module without losing enum fields");
    runNode("scripts/make-modules.mjs", [
      "module",
      tagModule,
      "color:string=optional",
      "--no-interaction",
    ]);
    assertFileContains(
      path.join(tagPath, "domain", `${singularize(tagModule)}.entity.ts`),
      "color?: string;",
      "existing module update should add optional scalar",
    );
    assertFileContains(
      path.join(tagPath, "domain", `${singularize(tagModule)}.entity.ts`),
      `${tagClass}KindValues`,
      "existing module update should preserve enum values",
    );

    step("Validate generated architecture");
    runNode("scripts/check-modules.mjs", []);

    step("Validate Prisma dry-run output");
    const prismaOutput = runNode("scripts/make-prisma.mjs", ["--dry-run"]);
    assertTextContains(prismaOutput, `enum ${articleClass}Status`, "Prisma should include article enum");
    assertTextContains(prismaOutput, `enum ${tagClass}Kind`, "Prisma should include tag enum");
    assertTextContains(prismaOutput, `model ${articleClass}`, "Prisma should include article model");
    assertTextContains(prismaOutput, `model ${tagClass}`, "Prisma should include tag model");
    assertTextContains(prismaOutput, "tagRefId", "Prisma should include ManyToOne foreign key");
    assertTextContains(prismaOutput, "tagRefs", "Prisma should include ManyToMany field");
    assertTextContains(prismaOutput, "@relation", "Prisma should include relation metadata");

    step("Validate controlled CLI errors");
    expectFailure(
      ["module", tagModule, "label:string", "--no-interaction"],
      'La property "label" existe deja.',
    );
    expectFailure(
      ["module", tagModule, "id:string", "--no-interaction"],
      'Le champ "id" est reserve par l\'architecture.',
    );
    expectFailure(
      ["module", tagModule, "flavor:enum:hot,hot", "--no-interaction"],
      "Une enum contient des valeurs en doublon.",
    );

    console.log(`${colors.green("OK")} Generator integration test passed`);
  } finally {
    cleanup();
  }
}

function assertGeneratedArticle() {
  const entityPath = path.join(
    articlePath,
    "domain",
    `${singularize(articleModule)}.entity.ts`,
  );
  const actionPath = path.join(articlePath, "presentation", "actions.ts");
  const dtoPath = path.join(
    articlePath,
    "application",
    "dtos",
    `${singularize(articleModule)}.dto.ts`,
  );

  assertFileContains(
    entityPath,
    `export const ${articleClass}StatusValues = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;`,
    "entity should expose enum values",
  );
  assertFileContains(entityPath, `status: ${articleClass}Status;`, "entity should use enum type");
  assertFileContains(entityPath, `tagRefId: string; // @relation(${tagClass})`, "entity should keep ManyToOne target");
  assertFileContains(entityPath, `tagRefIds: string[]; // @relation(${tagClass})`, "entity should keep ManyToMany target");
  assertFileContains(actionPath, `${articleClass}StatusValues`, "action should import enum values");
  assertFileContains(actionPath, "readEnum", "action should validate enum values");
  assertFileContains(actionPath, "readStringList", "action should read ManyToMany ids");
  assertFileContains(dtoPath, `${articleClass}Status`, "DTO should expose enum type");
}

function assertGeneratedTag() {
  const entityPath = path.join(
    tagPath,
    "domain",
    `${singularize(tagModule)}.entity.ts`,
  );
  const actionPath = path.join(tagPath, "presentation", "actions.ts");

  assertFileContains(
    entityPath,
    `export const ${tagClass}KindValues = ["PRIMARY", "SECONDARY"] as const;`,
    "target entity should expose enum values",
  );
  assertFileContains(entityPath, `kind: ${tagClass}Kind;`, "target entity should use enum type");
  assertFileContains(actionPath, "readEnum", "target action should validate enum values");
}

function expectFailure(args, expectedMessage) {
  const result = spawnSync(process.execPath, ["scripts/make-modules.mjs", ...args], {
    cwd: root,
    encoding: "utf8",
  });
  const output = `${result.stdout}${result.stderr}`;

  if (result.status === 0) {
    throw new Error(`Expected command to fail: ${args.join(" ")}`);
  }

  assertTextContains(output, expectedMessage, `failure output should contain: ${expectedMessage}`);
  assertTextExcludes(output, "at file://", "controlled errors should not print stack traces");
}

function runNode(script, args) {
  const result = spawnSync(process.execPath, [script, ...args], {
    cwd: root,
    encoding: "utf8",
  });
  const output = `${result.stdout}${result.stderr}`;

  if (result.status !== 0) {
    throw new Error(`Command failed: node ${script} ${args.join(" ")}\n${output}`);
  }

  return output;
}

function assertFileContains(filePath, expected, message) {
  const content = fs.readFileSync(filePath, "utf8");
  assertTextContains(content, expected, message);
}

function assertTextContains(content, expected, message) {
  if (!content.includes(expected)) {
    throw new Error(`${message}\nMissing: ${expected}`);
  }
}

function assertTextExcludes(content, unexpected, message) {
  if (content.includes(unexpected)) {
    throw new Error(`${message}\nUnexpected: ${unexpected}`);
  }
}

function cleanup() {
  fs.rmSync(tagPath, { recursive: true, force: true });
  fs.rmSync(articlePath, { recursive: true, force: true });
  console.log(`${colors.dim("-")} Temporary modules cleaned`);
}

function ensureTempModuleDoesNotExist(targetPath) {
  if (fs.existsSync(targetPath)) {
    throw new Error(`Temporary test module already exists: ${targetPath}`);
  }
}

function modulePath(moduleName) {
  return path.join(root, "src", "modules", moduleName);
}

function buildClassName(moduleName) {
  return toPascalCase(singularize(moduleName));
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

function step(label) {
  console.log(`${colors.cyan("›")} ${label}`);
}

function paint(value, code) {
  return colorEnabled ? `\u001b[${code}m${value}\u001b[0m` : value;
}
