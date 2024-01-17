import { WaveCommand } from "wave-shell";
import { FilesStructure, createFilesOrDirectories } from "./utils/create-files-or-directories";

export default {
  description: "Initialize a new project",
  run: async (options) => {
    const filesStructure: FilesStructure = {
      src: {
        tests: ['index.ts'],
        abc: {
          test: ['index.ts'],
          test2: ['index.ts'],
        }
      }
    }

    createFilesOrDirectories(filesStructure);
  },
} as WaveCommand;