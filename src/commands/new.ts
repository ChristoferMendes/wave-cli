import { WaveCommand } from "wave-shell";
import { z } from "zod";
import { join } from "path";
import { createFileStructure } from "../utils/create-file-structure";

export default {
  argsSchema: () => {
    return {
      argsArraySchema: z
        .array(
          z.string().refine((data) => isNaN(Number(data)), {
            message: "Input should be a string and not a number.",
          })
        )
        .nonempty(),
    }
  },
  async run({ args, compileTemplate }) {
    const [name, description] = args.argsArray

    const templatesFolder = join(process.cwd(), "src/templates/")

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
    
    Bun.write(join(process.cwd(), "src", "commands", `${name}.ts`), result)
  },
} as WaveCommand