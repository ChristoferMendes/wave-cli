import { WaveCommand } from "wave-shell";
import { join } from "path";
import { FilesStructure, createFileStructure } from "../utils/create-file-structure";

export default {
  description: "Initialize a new project",
  run: async (options) => {
    const { compileTemplate, args } = options; 
    const [commandName, commandDescription] = args.argsArray

    const filesStructure: FilesStructure = {
      src: {
        commands: [`${commandName}.ts`]
      }
    }

    createFileStructure(filesStructure);

    const commandTemplatePath = join(process.cwd(), 'src/templates/command.surf');
    const parsedTemplate = await compileTemplate(commandTemplatePath, {
      description: commandDescription
    });

    const commandFilePath = join(process.cwd(), `src/commands/${commandName}.ts`);
    Bun.write(commandFilePath, parsedTemplate);
  },
} as WaveCommand;