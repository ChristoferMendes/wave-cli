import { join } from "path";
import { WaveCommand } from "wave-shell";
import { z } from "zod";
import { createFileStructure } from "../utils/create-file-structure";

const exampleCommand = ['wave new hello-world']

export default {
  description: 'Add a new command inside src/commands',
  argsSchema: () => {
    return {
      argsArraySchema: z
        .array(
          z.string().refine((data) => isNaN(Number(data)), {
            message: "Command name should be a string and not a number.",
          })
        )
        .nonempty({
          message: `Please, type the name of the command: \n\nExample: ${exampleCommand}`
        }),
    }
  },
  async run({ args, compileTemplate }) {
    const [name, description] = args.argsArray

    const templatesFolder = join(__dirname, "../templates/")

    const filePath = join(templatesFolder, "command.surf")

    createFileStructure({
      src: {
        commands: [`${name}.ts`]
      }
    })

    const result = await compileTemplate(filePath, {
      description,
      name
    })
    
    Bun.write(join(__dirname, `${name}.ts`), result)
  },
} as WaveCommand