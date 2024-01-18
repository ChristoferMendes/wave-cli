import { WaveCommand } from "wave-shell";
import { FilesStructure, createFilesOrDirectories } from "./utils/create-files-or-directories";
import { join } from "path";

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

    createFilesOrDirectories(filesStructure);

    const helpFilePath = join(process.cwd(), `src/commands/${commandName}.ts`);
    const helpTemplatePath = join(process.cwd(), 'src/templates/command.surf');
    const result = await compileTemplate(helpTemplatePath, {
      description: commandDescription
    });
    Bun.write(helpFilePath, result);
  },
} as WaveCommand;