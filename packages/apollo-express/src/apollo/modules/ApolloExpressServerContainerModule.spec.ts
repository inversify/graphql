import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mock,
  vitest,
} from 'vitest';

vitest.mock('@apollo/server/plugin/drainHttpServer');
vitest.mock('../controllers/buildApolloServerExpressController.js');

import { type BaseContext } from '@apollo/server';
import { type ExpressContextFunctionArgument } from '@as-integrations/express5';
import {
  type ApolloServerController,
  apolloServerPluginsServiceIdentifier,
  apolloServerResolversServiceIdentifier,
  apolloServerTypeDefsServiceIdentifier,
} from '@inversifyjs/apollo-core';
import { httpServerServiceIdentifier } from '@inversifyjs/http-core';
import { type ContainerModuleLoadOptions, type Newable } from 'inversify';

import buildApolloServerExpressController from '../controllers/buildApolloServerExpressController.js';
import { type ApolloServerExpressControllerOptions } from '../models/ApolloExpressControllerOptions.js';
import { type ApolloServerInjectOptions } from '../models/ApolloServerInjectOptions.js';
import ApolloExpressServerContainerModule from './ApolloExpressServerContainerModule.js';

describe(ApolloExpressServerContainerModule, () => {
  describe('.forOptions()', () => {
    let controllerOptionsFixture: ApolloServerExpressControllerOptions<BaseContext>;
    let serverOptionsFixture: ApolloServerInjectOptions<BaseContext>;
    let controllerClassMock: Newable<
      ApolloServerController<BaseContext, [ExpressContextFunctionArgument]>
    >;

    let containerModule: ApolloExpressServerContainerModule;

    beforeAll(() => {
      controllerOptionsFixture = {
        controllerOptions: '/graphql',
        getContext: vitest.fn(),
      };

      serverOptionsFixture = {
        plugins: [],
        resolvers: {},
        typeDefs: 'type Query { hello: String }',
      };

      controllerClassMock = class {} as Newable<
        ApolloServerController<BaseContext, [ExpressContextFunctionArgument]>
      >;

      vitest
        .mocked(buildApolloServerExpressController)
        .mockReturnValueOnce(controllerClassMock);

      containerModule = ApolloExpressServerContainerModule.forOptions(
        controllerOptionsFixture,
        serverOptionsFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should return ApolloExpressServerContainerModule', () => {
      expect(containerModule).toBeInstanceOf(
        ApolloExpressServerContainerModule,
      );
    });

    describe('when called load()', () => {
      let bindToFluentSyntaxMock: {
        toSelf: Mock;
        toResolvedValue: Mock;
        toConstantValue: Mock;
      };
      let containerModuleLoadOptionsMock: {
        bind: Mock;
      };

      let result: unknown;

      beforeAll(async () => {
        vitest.clearAllMocks();

        bindToFluentSyntaxMock = {
          toConstantValue: vitest.fn(),
          toResolvedValue: vitest.fn(),
          toSelf: vitest.fn(),
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

      it('should call buildApolloServerExpressController()', () => {
        expect(
          buildApolloServerExpressController,
        ).toHaveBeenCalledExactlyOnceWith(controllerOptionsFixture);
      });

      it('should call options.bind()', () => {
        expect(containerModuleLoadOptionsMock.bind).toHaveBeenCalledTimes(5);
        expect(containerModuleLoadOptionsMock.bind).toHaveBeenNthCalledWith(
          2,
          controllerClassMock,
        );
        expect(containerModuleLoadOptionsMock.bind).toHaveBeenNthCalledWith(
          3,
          apolloServerPluginsServiceIdentifier,
        );
        expect(containerModuleLoadOptionsMock.bind).toHaveBeenNthCalledWith(
          4,
          apolloServerResolversServiceIdentifier,
        );
        expect(containerModuleLoadOptionsMock.bind).toHaveBeenNthCalledWith(
          5,
          apolloServerTypeDefsServiceIdentifier,
        );
      });

      it('should call bind.toSelf()', () => {
        expect(bindToFluentSyntaxMock.toSelf).toHaveBeenCalledExactlyOnceWith();
      });

      it('should call bind.toResolvedValue()', () => {
        expect(bindToFluentSyntaxMock.toResolvedValue).toHaveBeenCalledTimes(2);
        expect(bindToFluentSyntaxMock.toResolvedValue).toHaveBeenNthCalledWith(
          2,
          expect.any(Function),
          [httpServerServiceIdentifier],
        );
      });

      it('should call bind.toConstantValue()', () => {
        expect(bindToFluentSyntaxMock.toConstantValue).toHaveBeenCalledTimes(2);
        expect(bindToFluentSyntaxMock.toConstantValue).toHaveBeenNthCalledWith(
          1,
          serverOptionsFixture.resolvers,
        );

        expect(bindToFluentSyntaxMock.toConstantValue).toHaveBeenNthCalledWith(
          2,
          serverOptionsFixture.typeDefs,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });
});
