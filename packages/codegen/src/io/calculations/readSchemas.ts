import { glob } from 'glob';

import { type ReadSchemasOptions } from '../models/ReadSchemasOptions.js';
import parseGraphqlFile from './parseGraphqlFile.js';

export default async function readSchemas(
  options: ReadSchemasOptions,
): Promise<string[]> {
  const graphqlSchemasPaths: string[] = await glob(
    options.glob.patterns,
    options.glob.options,
  );

  const graphqlSchemas: string[] = await Promise.all(
    graphqlSchemasPaths.map(async (jsonSchemaPath: string) =>
      parseGraphqlFile(jsonSchemaPath),
    ),
  );

  return graphqlSchemas;
}
