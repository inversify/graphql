import fs from 'node:fs/promises';

export default async function parseGraphqlFile(path: string): Promise<string> {
  const fileContentBuffer: Buffer = await fs.readFile(path);

  const fileStringifiedContent: string = fileContentBuffer.toString();

  return fileStringifiedContent;
}
