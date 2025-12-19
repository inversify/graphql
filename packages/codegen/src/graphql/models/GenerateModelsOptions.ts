import { type TypeScriptPluginConfig } from '@graphql-codegen/typescript';
import { type TypeScriptResolversPluginConfig } from '@graphql-codegen/typescript-resolvers';
import type prettier from 'prettier';

import { type ReadSchemasOptions } from '../../io/models/ReadSchemasOptions.js';

export interface GenerateModelsOptions {
  bannerContent?: string;
  destinationPath: string;
  pluginConfig?: TypeScriptPluginConfig & TypeScriptResolversPluginConfig;
  prettierConfig?: prettier.Options;
  schemas: ReadSchemasOptions;
}
