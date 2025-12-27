import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mock,
  vitest,
} from 'vitest';

vitest.mock('@as-integrations/fastify');
vitest.mock('../controllers/buildApolloServerFastifyController.js');

import { type BaseContext } from '@apollo/server';
import { type ApolloFastifyContextFunctionArgument } from '@as-integrations/fastify';
import {
  type ApolloServerController,
  apolloServerPluginsServiceIdentifier,
  apolloServerResolversServiceIdentifier,
  apolloServerTypeDefsServiceIdentifier,
  httpServerServiceIdentifier,
} from '@inversifyjs/apollo-core';
import { httpApplicationServiceIdentifier } from '@inversifyjs/http-core';
import { type ContainerModuleLoadOptions, type Newable } from 'inversify';

import buildApolloServerFastifyController from '../controllers/buildApolloServerFastifyController.js';
import { type ApolloFastifyControllerOptions } from '../models/ApolloFastifyControllerOptions.js';
import { type ApolloServerInjectOptions } from '../models/ApolloServerInjectOptions.js';
import ApolloFastifyServerContainerModule from './ApolloFastifyServerContainerModule.js';

describe(ApolloFastifyServerContainerModule, () => {
  describe('.fromOptions()', () => {
    let controllerOptionsFixture: ApolloFastifyControllerOptions<BaseContext>;
    let serverOptionsFixture: ApolloServerInjectOptions<BaseContext>;
    let controllerClassMock: Newable<
      ApolloServerController<
        BaseContext,
        [ApolloFastifyContextFunctionArgument]
      >
    >;

    beforeAll(() => {
      controllerOptionsFixture = {
        controllerOptions: '/graphql',
        getContext: vitest.fn(),
      };

      serverOptionsFixture = {
        plugins: [],
        resolverServiceIdentifier: Symbol(),
        typeDefs: 'type Query { hello: String }',
      };
    });

    describe('when called', () => {
      let containerModule: ApolloFastifyServerContainerModule;

      beforeAll(() => {
        controllerClassMock = class {} as Newable<
          ApolloServerController<
            BaseContext,
            [ApolloFastifyContextFunctionArgument]
          >
        >;

        vitest
          .mocked(buildApolloServerFastifyController)
          .mockReturnValueOnce(controllerClassMock);

        containerModule = ApolloFastifyServerContainerModule.fromOptions(
          controllerOptionsFixture,
          serverOptionsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should return ApolloFastifyServerContainerModule', () => {
        expect(containerModule).toBeInstanceOf(
          ApolloFastifyServerContainerModule,
        );
      });

      describe('when called load()', () => {
        let bindToFluentSyntaxMock: {
          inSingletonScope: Mock;
          to: Mock;
          toConstantValue: Mock;
          toSelf: Mock;
          toResolvedValue: Mock;
          toService: Mock;
        };
        let containerModuleLoadOptionsMock: {
          bind: Mock;
        };

        let result: unknown;

        beforeAll(async () => {
          vitest.clearAllMocks();

          bindToFluentSyntaxMock = {
            inSingletonScope: vitest.fn(),
            to: vitest.fn().mockReturnThis(),
            toConstantValue: vitest.fn(),
            toResolvedValue: vitest.fn().mockReturnThis(),
            toSelf: vitest.fn().mockReturnThis(),
            toService: vitest.fn(),
          };

          containerModuleLoadOptionsMock = {
            bind: vitest.fn().mockReturnValue(bindToFluentSyntaxMock),
          };

          result = await containerModule.load(
            containerModuleLoadOptionsMock as unknown as ContainerModuleLoadOptions,
          );
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call buildApolloServerFastifyController()', () => {
          expect(
            buildApolloServerFastifyController,
          ).toHaveBeenCalledExactlyOnceWith(controllerOptionsFixture);
        });

        it('should call options.bind()', () => {
          expect(containerModuleLoadOptionsMock.bind).toHaveBeenCalledTimes(8);
          expect(containerModuleLoadOptionsMock.bind).toHaveBeenNthCalledWith(
            4,
            controllerClassMock,
          );
          expect(containerModuleLoadOptionsMock.bind).toHaveBeenNthCalledWith(
            5,
            httpServerServiceIdentifier,
          );
          expect(containerModuleLoadOptionsMock.bind).toHaveBeenNthCalledWith(
            6,
            apolloServerPluginsServiceIdentifier,
          );
          expect(containerModuleLoadOptionsMock.bind).toHaveBeenNthCalledWith(
            7,
            apolloServerResolversServiceIdentifier,
          );
          expect(containerModuleLoadOptionsMock.bind).toHaveBeenNthCalledWith(
            8,
            apolloServerTypeDefsServiceIdentifier,
          );
        });

        it('should call bind.toSelf()', () => {
          expect(
            bindToFluentSyntaxMock.toSelf,
          ).toHaveBeenCalledExactlyOnceWith();
        });

        it('should call bind.toResolvedValue()', () => {
          expect(bindToFluentSyntaxMock.toResolvedValue).toHaveBeenCalledTimes(
            4,
          );
          expect(bindToFluentSyntaxMock.toResolvedValue).toHaveBeenCalledWith(
            expect.any(Function),
            [httpApplicationServiceIdentifier],
          );
        });

        it('should call bind.toConstantValue()', () => {
          expect(
            bindToFluentSyntaxMock.toConstantValue,
          ).toHaveBeenCalledExactlyOnceWith(serverOptionsFixture.typeDefs);
        });

        it('should call bind.toService()', () => {
          expect(
            bindToFluentSyntaxMock.toService,
          ).toHaveBeenCalledExactlyOnceWith(
            serverOptionsFixture.resolverServiceIdentifier,
          );
        });

        it('should call bind.toResolvedValue().inSingletonScope()', () => {
          expect(bindToFluentSyntaxMock.inSingletonScope).toHaveBeenCalledTimes(
            6,
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
