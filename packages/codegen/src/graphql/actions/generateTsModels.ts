import fs from 'node:fs/promises';
import path from 'node:path';

import { CodegenConfig, executeCodegen } from '@graphql-codegen/cli';
import { type Types } from '@graphql-codegen/plugin-helpers';
import { TypeScriptPluginConfig } from '@graphql-codegen/typescript';
import { TypeScriptResolversPluginConfig } from '@graphql-codegen/typescript-resolvers';

import writeDefinitions from '../../io/actions/writeDefinitions.js';
import readSchemas from '../../io/calculations/readSchemas.js';
import { type GenerateModelsOptions } from '../models/GenerateModelsOptions.js';

export default async function generateTsModels(
  options: GenerateModelsOptions,
): Promise<void> {
  await fs.mkdir(path.dirname(options.destinationPath), { recursive: true });

  const pluginConfig: TypeScriptPluginConfig & TypeScriptResolversPluginConfig =
    options.pluginConfig ?? {
      avoidOptionals: true,
      enumsAsTypes: true,
      resolverTypeWrapperSignature: 'Partial<T> | Promise<Partial<T>>',
      useIndexSignature: true,
    };

  /*
   * Consider https://the-guild.dev/graphql/codegen/plugins/typescript/typescript as reference
   * Consider https://the-guild.dev/graphql/codegen/plugins/typescript/typescript-resolvers as refrence
   */
  const config: CodegenConfig = {
    generates: {
      [options.destinationPath]: {
        config: pluginConfig,
        plugins: ['typescript', 'typescript-resolvers'],
      },
    },
    schema: await readSchemas(options.schemas),
  };

  const {
    result: fileOutputs,
    error,
  }: {
    result: Types.FileOutput[];
    error: Error | null;
  } = await executeCodegen(config);

  if (error !== null) {
    throw error;
  }

  await writeDefinitions({
    bannerContent: options.bannerContent,
    fileOutputs,
    prettierConfig: options.prettierConfig,
  });
}
