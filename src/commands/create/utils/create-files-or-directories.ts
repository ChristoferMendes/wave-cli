import fs from 'fs';
import path from 'path';

export type FilesStructure = {
  [key: string]: string[] | FilesStructure;
};

function createDirectory(directoryPath: string) {
  fs.mkdirSync(directoryPath, { recursive: true });
}

function createFile(filePath: string, content = '') {
  fs.writeFileSync(filePath, content);
}

export function createFilesOrDirectories(structure: FilesStructure, currentPath = '') {
  for (const key in structure) {
    const newPath = path.join(currentPath, key);

    if (typeof structure[key] === 'object' && !Array.isArray(structure[key])) {
      createDirectory(newPath);
      createFilesOrDirectories(structure[key] as FilesStructure, newPath);
    } else if (Array.isArray(structure[key])) {
      (structure[key] as string[]).forEach((file: string) => {
        const filePath = path.join(newPath, file);
        createDirectory(path.dirname(filePath));
        createFile(filePath);
      });
    } else {
      throw new Error(`Invalid structure: key ${key} must be either a FilesStructure or an array of strings`);
    }
  }
}