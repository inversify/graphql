import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mock,
  Mocked,
  vitest,
} from 'vitest';

import { ContainerModule, ContainerModuleLoadOptions } from 'inversify';

import { apolloServerGraphqlServiceIdentifier } from '../models/apolloServerGraphqlServiceIdentifier.js';
import { apolloServerPluginsServiceIdentifier } from '../models/apolloServerPluginsServiceIdentifier.js';
import { apolloServerResolversServiceIdentifier } from '../models/apolloServerResolversServiceIdentifier.js';
import { apolloServerServiceIdentifier } from '../models/apolloServerServiceIdentifier.js';
import { apolloServerTypeDefsServiceIdentifier } from '../models/apolloServerTypeDefsServiceIdentifier.js';
import { ApolloServerContainerModule } from './ApolloServerContainerModule.js';

describe(ApolloServerContainerModule, () => {
  describe('constructor', () => {
    let loadMock: Mock<(options: unknown) => void | Promise<void>>;

    beforeAll(() => {
      loadMock = vitest.fn();
    });

    describe('when called', () => {
      let containerModule: ContainerModule;

      beforeAll(() => {
        containerModule = new ApolloServerContainerModule(loadMock);
      });

      describe('when called load()', () => {
        let containerModuleLoadOptionsMock: Mocked<ContainerModuleLoadOptions>;
        let bindToFluentSyntaxMock: {
          inSingletonScope: Mock;
          toResolvedValue: Mock;
        };

        let result: unknown;

        beforeAll(async () => {
          bindToFluentSyntaxMock = {
            inSingletonScope: vitest.fn(),
            toResolvedValue: vitest.fn().mockReturnThis(),
          };

          containerModuleLoadOptionsMock = {
            bind: vitest
              .fn()
              .mockReturnValue(bindToFluentSyntaxMock) as unknown,
          } as Partial<
            Mocked<ContainerModuleLoadOptions>
          > as Mocked<ContainerModuleLoadOptions>;

          result = await containerModule.load(containerModuleLoadOptionsMock);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call options.bind()', () => {
          expect(containerModuleLoadOptionsMock.bind).toHaveBeenCalledTimes(2);
          expect(containerModuleLoadOptionsMock.bind).toHaveBeenCalledWith(
            apolloServerGraphqlServiceIdentifier,
          );
          expect(containerModuleLoadOptionsMock.bind).toHaveBeenCalledWith(
            apolloServerServiceIdentifier,
          );
        });

        it('should call bind.toResolvedValue()', () => {
          expect(bindToFluentSyntaxMock.toResolvedValue).toHaveBeenCalledTimes(
            2,
          );
          expect(bindToFluentSyntaxMock.toResolvedValue).toHaveBeenCalledWith(
            expect.any(Function),
            [
              apolloServerResolversServiceIdentifier,
              apolloServerTypeDefsServiceIdentifier,
            ],
          );
          expect(bindToFluentSyntaxMock.toResolvedValue).toHaveBeenCalledWith(
            expect.any(Function),
            [
              {
                isMultiple: true,
                serviceIdentifier: apolloServerPluginsServiceIdentifier,
              },
              apolloServerGraphqlServiceIdentifier,
            ],
          );
        });

        it('should call bind.toResolvedValue().inSingletonScope()', () => {
          expect(bindToFluentSyntaxMock.inSingletonScope).toHaveBeenCalledTimes(
            2,
          );
          expect(
            bindToFluentSyntaxMock.inSingletonScope,
          ).toHaveBeenCalledWith();
        });

        it('should return undefined', () => {
          expect(result).toBeUndefined();
        });
      });
    });
  });
});
