import { $ } from 'bun';
import { join, } from "path";
import { WaveArguments, WaveCommand, WavePrint, changeRootToDistOnProdMode, prompt, waveColors } from "wave-shell";
import { z } from "zod";
import { FilesStructure, createFileStructure } from "~/utils/create-file-structure";

const baseRoot = join(__dirname, '..', '..');
const root  = changeRootToDistOnProdMode(baseRoot);

type CompileTemplateFn = (filePath: string, data: Record<string, any>) => Promise<string>;

async function getProjectName(args: WaveArguments, print: ReturnType<typeof WavePrint>) {
  let [name] = args.argsArray;

  if (!name) {
    name = await prompt.ask("What's the name of your project? ");
  }

  const isValidPackageJsonNameRegex = /^[a-z0-9-_.]+$/;

  if (!isValidPackageJsonNameRegex.test(name)) {
    print.error("Input should be a valid package.json name (only lowercase letters, numbers, and -_. are allowed).");
    process.exit(1);
  }

  return name;
}

async function createProjectStructure(projectName: string) {
  const filesStructure: FilesStructure = {
    [projectName]: {
      bin: [projectName],
      src: {
        commands: [`${projectName}.ts`],
      },
    },
  };
  createFileStructure(filesStructure);
}

async function compileTemplates(projectName: string, compileTemplate: (filePath: string, data: Record<string, any>) => Promise<string>) {
  const creationTemplatePath = join(root, "src/templates/create/");

  const bin = await compileTemplate(join(creationTemplatePath, "bin.surf"), {
    projectName,
  });

  const command = await compileTemplate(
    join(creationTemplatePath, "hello-world.surf"),
    {
      description: "Hello World command",
    }
  );

  return { bin, command };
}

async function writeTemplates(projectName: string, bin: string, command: string) {
  await Bun.write(join(process.cwd(), projectName, "bin", projectName), bin);
  await Bun.write(join(process.cwd(), projectName, "src", "commands", `${projectName}.ts`), command);
}

async function writeBuilderScript(projectName: string, compileTemplate: CompileTemplateFn) {
  const builderScript = await compileTemplate(join(root, "src/templates/create/builder.surf"), {});

  await Bun.write(join(process.cwd(), projectName, "src", "builder.ts"), builderScript);
}

async function installDependencies(projectName: string) {
  await $`cd ${projectName} && bun init -y > /dev/null`;
  await $`cd ${projectName} && bun install wave-shell --silent`;
}

function getPackageJson(path: string) {
  const packageJsonPath = join(process.cwd(), path, "package.json");
  return require(packageJsonPath);
}

function injectBinNameOnPackageJson(packageJson: Record<string, any>, projectName: string) {
  packageJson.bin = {
    [projectName]: `bin/${projectName}`,
  };
  return packageJson;
}

function injectBuildScriptOnPackageJson(packageJson: Record<string, any>) {
  packageJson.scripts = {
    ...packageJson.scripts,
    build: "bun run src/builder.ts",
  };

  return packageJson;
}

async function writePackageJson(projectName: string, newPackageJson: Record<string, any>) {
  const packageJsonPath = join(process.cwd(), projectName, "package.json");
  await Bun.write(join(packageJsonPath), JSON.stringify(newPackageJson, null, 2));
}

async function createNpmIgnore(projectName: string, compileTemplate: CompileTemplateFn) {
  const npmIgnoreContent = await compileTemplate(join(root, "src/templates/create/npmignore.surf"), {})

  await Bun.write(join(process.cwd(), projectName, ".npmignore"), npmIgnoreContent);
}


async function linkProject(projectName: string) {
  await $`cd ${projectName} && bun link --silent`;
}

function logLastSteps(projectName: string, print: ReturnType<typeof WavePrint>) {
  const cdWithColors = waveColors.yellow(`cd ${projectName}`);
  const projectNameWithColors = waveColors.yellow(projectName);

  print.spaceLine()
  print.info(`📂 Go to the project folder with: ${cdWithColors}`)
  print.info(`🎉 You can now type ${projectNameWithColors} to get started`)
}


export default {
  description: "Initialize a new project from scratch",
  argsSchema: () => {
    return {
      argsArraySchema: z
        .array(
          z.string().refine((data) => isNaN(Number(data)), {
            message: "Input should be a string and not a number.",
          }).refine((data) => {
            const isValidPackageJsonNameRegex = /^[a-z0-9-_.]+$/;

            return isValidPackageJsonNameRegex.test(data);
          }, {
            message: "Input should be a valid package.json name (only lowercase letters, numbers, and -_. are allowed)."
          })
        )
    };
  },
  run: async ({ args, compileTemplate, print }) => {
    const projectName = await getProjectName(args, print);

    print.success(`✨ Creating project ${projectName}...`);
    await createProjectStructure(projectName);

    const { bin, command } = await compileTemplates(projectName, compileTemplate);
    await writeTemplates(projectName, bin, command);

    await writeBuilderScript(projectName, compileTemplate)

    print.info("📦 Installing dependencies...");
    await installDependencies(projectName);

    const packageJson = getPackageJson(projectName);

    injectBinNameOnPackageJson(packageJson, projectName);
    injectBuildScriptOnPackageJson(packageJson);

    await writePackageJson(projectName, packageJson);

    await createNpmIgnore(projectName, compileTemplate);

    await linkProject(projectName)

    print.success(`🚀 Project ${projectName} created successfully!`);
    logLastSteps(projectName, print)

  },
} as WaveCommand;
