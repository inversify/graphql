import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('node:fs/promises');

import fs from 'node:fs/promises';

import parseGraphqlFile from './parseGraphqlFile.js';

describe(parseGraphqlFile, () => {
  let pathFixture: string;

  beforeAll(() => {
    pathFixture = 'some-path-fixture';
  });

  describe('when called', () => {
    let fileContentFixture: string;

    let result: unknown;

    beforeAll(async () => {
      fileContentFixture = 'some-file-content-fixture';

      vitest
        .mocked(fs.readFile)
        .mockResolvedValueOnce(Buffer.from(fileContentFixture));

      result = await parseGraphqlFile(pathFixture);
    });

    afterAll(() => {
      vitest.resetAllMocks();
    });

    it('should call fs.readFile()', () => {
      expect(fs.readFile).toHaveBeenCalledExactlyOnceWith(pathFixture);
    });

    it('should return expected result', () => {
      expect(result).toBe(fileContentFixture);
    });
  });
});
