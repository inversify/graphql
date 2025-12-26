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
  httpServerServiceIdentifier,
} from '@inversifyjs/apollo-core';
import { httpApplicationServiceIdentifier } from '@inversifyjs/http-core';
import { type ContainerModuleLoadOptions, type Newable } from 'inversify';

import buildApolloServerExpressController from '../controllers/buildApolloServerExpressController.js';
import { type ApolloServerExpressControllerOptions } from '../models/ApolloExpressControllerOptions.js';
import { type ApolloServerInjectOptions } from '../models/ApolloServerInjectOptions.js';
import ApolloExpressServerContainerModule from './ApolloExpressServerContainerModule.js';

describe(ApolloExpressServerContainerModule, () => {
  describe('.fromOptions()', () => {
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
        resolverServiceIdentifier: Symbol(),
        typeDefs: 'type Query { hello: String }',
      };

      controllerClassMock = class {} as Newable<
        ApolloServerController<BaseContext, [ExpressContextFunctionArgument]>
      >;

      vitest
        .mocked(buildApolloServerExpressController)
        .mockReturnValueOnce(controllerClassMock);

      containerModule = ApolloExpressServerContainerModule.fromOptions(
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

      it('should call buildApolloServerExpressController()', () => {
        expect(
          buildApolloServerExpressController,
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
        expect(bindToFluentSyntaxMock.toSelf).toHaveBeenCalledExactlyOnceWith();
      });

      it('should call bind.toResolvedValue()', () => {
        expect(bindToFluentSyntaxMock.toResolvedValue).toHaveBeenCalledTimes(4);
        expect(bindToFluentSyntaxMock.toResolvedValue).toHaveBeenCalledWith(
          expect.any(Function),
          [httpApplicationServiceIdentifier],
        );
        expect(bindToFluentSyntaxMock.toResolvedValue).toHaveBeenCalledWith(
          expect.any(Function),
          [httpServerServiceIdentifier],
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
        expect(bindToFluentSyntaxMock.inSingletonScope).toHaveBeenCalledWith();
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });
});
