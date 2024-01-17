import { WaveCommand } from "wave-shell";
import { FilesStructure, createFilesOrDirectories } from "./utils/create-files-or-directories";
import { join } from "path";

export default {
  description: "Initialize a new project",
  run: async (options) => {
    const { compileTemplate } = options; 

    const filesStructure: FilesStructure = {
      src: {
        commands: ['help.ts']
      }
    }

    createFilesOrDirectories(filesStructure);

    const helpFilePath = join(process.cwd(), 'src/commands/help.ts');
    const helpTemplatePath = join(process.cwd(), 'src/templates/help.surf');
    const result = await compileTemplate(helpTemplatePath, {});
    Bun.write(helpFilePath, result);
  },
} as WaveCommand;