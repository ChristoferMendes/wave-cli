import { WaveCommand } from "wave-shell";
import { join } from "path";
import {
  FilesStructure,
  createFileStructure,
} from "../utils/create-file-structure";
import { z } from "zod";

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
    const [name] = args.argsArray;
    let projectName = name;

    if (!name) {
      projectName = await prompt.ask("What is the name of your project?");
    }

    const filesStructure: FilesStructure = {
      bin: [projectName],
      src: {
        commands: [`${projectName}.ts`],
      },
    };
    createFileStructure(filesStructure);

    const creationTemplatePath = join(process.cwd(), "src/templates/create/");

    const bin = await compileTemplate(join(creationTemplatePath, "bin.surf"), {
      projectName,
    });

    const command = await compileTemplate(
      join(creationTemplatePath, "hello-world.surf"),
      {
        description: "Hello World command",
      }
    );

    Bun.write(join(process.cwd(), "bin", projectName), bin);
    Bun.write(
      join(process.cwd(), "src", "commands", `${projectName}.ts`),
      command
    );

    print.success(`Project ${projectName} created successfully!`);

  },
} as WaveCommand;
