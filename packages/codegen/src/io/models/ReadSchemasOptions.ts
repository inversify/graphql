import { type GlobOptionsWithFileTypesUnset } from 'glob';

export interface ReadSchemasOptions {
  glob: {
    options?: GlobOptionsWithFileTypesUnset | undefined;
    patterns: string | string[];
  };
}
