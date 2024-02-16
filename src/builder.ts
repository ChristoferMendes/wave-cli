import { $ } from "bun";
import { WavePrint } from "wave-shell";

async function builder() {
  const print = WavePrint('Builder');
  print.info("Building project...");

  const extraEntrypoints = await getAllFilesInsideSubdirectoriesOfSrc();
  const extraEntrypointsString = extraEntrypoints.split("\n").filter(Boolean).filter(file => !file.endsWith('.surf'))

  await buildBun(extraEntrypointsString);
  await putTemplatesFolderInsideDist()

  print.success("Project built successfully!");
}

async function getAllFilesInsideSubdirectoriesOfSrc() {
  return await $`find src -type f -mindepth 2`.text();
}

async function buildBun(extraEntrypoints: string[]) {
  await Bun.build({
    entrypoints: ["index.ts", ...extraEntrypoints],
    outdir: "dist",
    minify: true,
    target: "bun",
  });
}

async function putTemplatesFolderInsideDist() {
  await $`cp -r src/templates dist/src/templates`;
}

await builder();
