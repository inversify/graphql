import { type Types } from '@graphql-codegen/plugin-helpers';
import type prettier from 'prettier';

export interface WriteDefinitionsOptions {
  bannerContent: string | undefined;
  fileOutputs: Types.FileOutput[];
  prettierConfig: prettier.Options | undefined;
}
