import generateTsModels from './graphql/actions/generateTsModels.js';
import { type GenerateModelsOptions } from './graphql/models/GenerateModelsOptions.js';
import { ReadSchemasOptions } from './io/models/ReadSchemasOptions.js';

export type { GenerateModelsOptions, ReadSchemasOptions };
export { generateTsModels };
