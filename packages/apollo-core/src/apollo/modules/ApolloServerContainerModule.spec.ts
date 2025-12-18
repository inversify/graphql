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

import {
  BindToFluentSyntax,
  ContainerModule,
  ContainerModuleLoadOptions,
} from 'inversify';

import { apolloServerPluginsServiceIdentifier } from '../models/apolloServerPluginsServiceIdentifier.js';
import { apolloServerResolversServiceIdentifier } from '../models/apolloServerResolversServiceIdentifier.js';
import { apolloServerTypeDefsServiceIdentifier } from '../models/apolloServerTypeDefsServiceIdentifier.js';
import { buildApolloServerServiceIdentifier } from '../models/buildApolloServerServiceIdentifier.js';
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
        let bindToFluentSyntaxMock: Mocked<BindToFluentSyntax<unknown>>;

        let result: unknown;

        beforeAll(async () => {
          bindToFluentSyntaxMock = {
            toResolvedValue: vitest.fn() as unknown,
          } as Partial<Mocked<BindToFluentSyntax<unknown>>> as Mocked<
            BindToFluentSyntax<unknown>
          >;

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
          expect(
            containerModuleLoadOptionsMock.bind,
          ).toHaveBeenCalledExactlyOnceWith(buildApolloServerServiceIdentifier);
        });

        it('should call bind.toResolvedValue()', () => {
          expect(
            bindToFluentSyntaxMock.toResolvedValue,
          ).toHaveBeenCalledExactlyOnceWith(expect.any(Function), [
            apolloServerPluginsServiceIdentifier,
            apolloServerResolversServiceIdentifier,
            apolloServerTypeDefsServiceIdentifier,
          ]);
        });

        it('should return undefined', () => {
          expect(result).toBeUndefined();
        });
      });
    });
  });
});
