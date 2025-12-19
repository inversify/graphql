import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('glob');
vitest.mock('./parseGraphqlFile.js');

import { glob } from 'glob';

import { type ReadSchemasOptions } from '../models/ReadSchemasOptions.js';
import parseGraphqlFile from './parseGraphqlFile.js';
import readSchemas from './readSchemas.js';

describe(readSchemas, () => {
  describe('when called', () => {
    let optionsFixture: ReadSchemasOptions;
    let graphqlPathsFixture: string[];
    let graphqlContentFixture: string[];

    let result: unknown;

    beforeAll(async () => {
      optionsFixture = {
        glob: {
          options: { cwd: '/test/path' },
          patterns: '**/*.graphql',
        },
      };

      graphqlPathsFixture = [
        'schema1.graphql',
        'schema2.graphql',
        'schema3.graphql',
      ];

      graphqlContentFixture = [
        'type Query { user: User }',
        'type User { id: ID! }',
        'type Mutation { createUser: User }',
      ];

      vitest.mocked(glob).mockResolvedValueOnce(graphqlPathsFixture);

      graphqlContentFixture.forEach((content: string) => {
        vitest.mocked(parseGraphqlFile).mockResolvedValueOnce(content);
      });

      result = await readSchemas(optionsFixture);
    });

    afterAll(() => {
      vitest.resetAllMocks();
    });

    it('should call glob()', () => {
      expect(glob).toHaveBeenCalledExactlyOnceWith(
        optionsFixture.glob.patterns,
        optionsFixture.glob.options,
      );
    });

    it('should call parseGraphqlFile() for each path', () => {
      expect(parseGraphqlFile).toHaveBeenCalledTimes(
        graphqlPathsFixture.length,
      );

      graphqlPathsFixture.forEach((path: string) => {
        expect(parseGraphqlFile).toHaveBeenCalledWith(path);
      });
    });

    it('should return expected result', () => {
      expect(result).toStrictEqual(graphqlContentFixture);
    });
  });
});
