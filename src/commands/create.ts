import { $ } from 'bun';
import { join } from "path";
import { WaveCommand } from "wave-shell";
import { z } from "zod";
import { FilesStructure, createFileStructure } from "~/utils/create-file-structure";

const root = join(__dirname, '..', '..');

async function getProjectName(prompt: any, args: any) {
  const [name] = args.argsArray;
  if (!name) {
    const response = await prompt.ask("What is the name of your project?");
    return response.value;
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
  Bun.write(join(process.cwd(), projectName, "bin", projectName), bin);
  Bun.write(join(process.cwd(), projectName, "src", "commands", `${projectName}.ts`), command);
}

async function installDependencies(projectName: string) {
  await $`cd ${projectName} && bun init > /dev/null`;
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

async function writePackageJson(projectName: string, newPackageJson: Record<string, any>) {
  const packageJsonPath = join(process.cwd(), projectName, "package.json");
  Bun.write(join(packageJsonPath), JSON.stringify(newPackageJson, null, 2));
}

export default {
  description: "Initialize a new project",
  argsSchema: () => {
    return {
      argsArraySchema: z
        .array(
          z.string().refine((data) => isNaN(Number(data)), {
            message: "Input should be a string and not a number.",
          })
        )
    };
  },
  run: async ({ args, compileTemplate, prompt, print }) => {
    const projectName = await getProjectName(prompt, args);

    print.success(`Creating project ${projectName}...`);
    await createProjectStructure(projectName);

    const { bin, command } = await compileTemplates(projectName, compileTemplate);
    await writeTemplates(projectName, bin, command);

    print.info("Installing dependencies...");
    await installDependencies(projectName);

    const newPackageJson = injectBinNameOnPackageJson(getPackageJson(projectName), projectName);
    await writePackageJson(projectName, newPackageJson);

    print.success(`Project ${projectName} created successfully!`);
  },
} as WaveCommand;
