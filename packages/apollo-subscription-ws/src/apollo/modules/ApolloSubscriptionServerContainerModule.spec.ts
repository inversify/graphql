import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mock,
  Mocked,
  vitest,
} from 'vitest';

vitest.mock('graphql-ws/use/ws');
vitest.mock('ws', () => ({
  WebSocketServer: class {},
}));

import type http from 'node:http';

import { type ApolloServerPlugin } from '@apollo/server';
import {
  apolloServerGraphqlServiceIdentifier,
  apolloServerPluginsServiceIdentifier,
  httpServerServiceIdentifier,
} from '@inversifyjs/apollo-core';
import { type GraphQLSchema } from 'graphql';
import { useServer } from 'graphql-ws/use/ws';
import { type ContainerModuleLoadOptions } from 'inversify';
import { WebSocketServer } from 'ws';

import { type ApolloSubscriptionServerContainerModuleOptions } from '../models/ApolloSubscriptionServerContainerModuleOptions.js';
import { wsServerServiceIdentifier } from '../models/wsServerServiceIdentifier.js';
import { ApolloSubscriptionServerContainerModule } from './ApolloSubscriptionServerContainerModule.js';

describe(ApolloSubscriptionServerContainerModule, () => {
  describe('constructor', () => {
    describe('when called without options', () => {
      let containerModule: ApolloSubscriptionServerContainerModule;

      beforeAll(() => {
        containerModule = new ApolloSubscriptionServerContainerModule();
      });

      it('should return ApolloSubscriptionServerContainerModule', () => {
        expect(containerModule).toBeInstanceOf(
          ApolloSubscriptionServerContainerModule,
        );
      });

      describe('when called load()', () => {
        let bindToFluentSyntaxMock: {
          inSingletonScope: Mock;
          toResolvedValue: Mock;
        };
        let containerModuleLoadOptionsMock: Mocked<ContainerModuleLoadOptions>;
        let wsServerResolverFunction: (
          httpServer: http.Server,
        ) => WebSocketServer;
        let pluginsResolverFunction: (
          graphqlSchema: GraphQLSchema,
          wsServer: WebSocketServer,
        ) => ApolloServerPlugin[];

        let result: unknown;

        beforeAll(async () => {
          bindToFluentSyntaxMock = {
            inSingletonScope: vitest.fn(),
            toResolvedValue: vitest.fn().mockReturnThis(),
          };

          containerModuleLoadOptionsMock = {
            bind: vitest.fn().mockReturnValue(bindToFluentSyntaxMock),
          } as Partial<
            Mocked<ContainerModuleLoadOptions>
          > as Mocked<ContainerModuleLoadOptions>;

          result = await containerModule.load(containerModuleLoadOptionsMock);

          // Capture resolver functions from toResolvedValue calls
          wsServerResolverFunction = vitest.mocked(
            bindToFluentSyntaxMock.toResolvedValue,
          ).mock.calls[0]?.[0] as (httpServer: http.Server) => WebSocketServer;

          pluginsResolverFunction = vitest.mocked(
            bindToFluentSyntaxMock.toResolvedValue,
          ).mock.calls[1]?.[0] as (
            graphqlSchema: GraphQLSchema,
            wsServer: WebSocketServer,
          ) => ApolloServerPlugin[];
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call options.bind()', () => {
          expect(containerModuleLoadOptionsMock.bind).toHaveBeenCalledTimes(2);
          expect(containerModuleLoadOptionsMock.bind).toHaveBeenNthCalledWith(
            1,
            wsServerServiceIdentifier,
          );
          expect(containerModuleLoadOptionsMock.bind).toHaveBeenNthCalledWith(
            2,
            apolloServerPluginsServiceIdentifier,
          );
        });

        it('should call bind.toResolvedValue()', () => {
          expect(bindToFluentSyntaxMock.toResolvedValue).toHaveBeenCalledTimes(
            2,
          );
          expect(
            bindToFluentSyntaxMock.toResolvedValue,
          ).toHaveBeenNthCalledWith(1, expect.any(Function), [
            httpServerServiceIdentifier,
          ]);
          expect(
            bindToFluentSyntaxMock.toResolvedValue,
          ).toHaveBeenNthCalledWith(2, expect.any(Function), [
            apolloServerGraphqlServiceIdentifier,
            wsServerServiceIdentifier,
          ]);
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

        describe('when wsServer resolver is called', () => {
          let httpServerMock: http.Server;

          let resolverResult: WebSocketServer;

          beforeAll(() => {
            httpServerMock = {} as http.Server;

            resolverResult = wsServerResolverFunction(httpServerMock);
          });

          afterAll(() => {
            vitest.clearAllMocks();
          });

          it('should return WebSocketServer instance', () => {
            expect(resolverResult).toBeInstanceOf(WebSocketServer);
          });
        });

        describe('when plugins resolver is called', () => {
          let graphqlSchemaMock: GraphQLSchema;
          let wsServerMock: WebSocketServer;
          let serverCleanupMock: { dispose: Mock };
          let plugins: ApolloServerPlugin[];

          beforeAll(() => {
            graphqlSchemaMock = {} as GraphQLSchema;
            wsServerMock = {} as WebSocketServer;

            serverCleanupMock = {
              dispose: vitest.fn(),
            };

            vitest.mocked(useServer).mockReturnValueOnce(serverCleanupMock);

            plugins = pluginsResolverFunction(graphqlSchemaMock, wsServerMock);
          });

          afterAll(() => {
            vitest.clearAllMocks();
          });

          it('should call useServer()', () => {
            expect(useServer).toHaveBeenCalledExactlyOnceWith(
              { schema: graphqlSchemaMock },
              wsServerMock,
            );
          });

          it('should return array with one plugin', () => {
            const expected: ApolloServerPlugin[] = [
              {
                serverWillStart: expect.any(Function),
              },
            ];

            expect(plugins).toStrictEqual(expected);
          });

          describe('when plugin serverWillStart is called', () => {
            let drainServerFn: () => Promise<void>;

            beforeAll(async () => {
              const plugin: ApolloServerPlugin | undefined = plugins[0];

              if (
                plugin === undefined ||
                plugin.serverWillStart === undefined
              ) {
                throw new Error('serverWillStart is undefined');
              }

              const serverWillStartResult: unknown =
                await plugin.serverWillStart({
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  apollo: {} as any,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  cache: {} as any,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  logger: {} as any,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  schema: {} as any,
                  startedInBackground: false,
                });

              if (
                serverWillStartResult === undefined ||
                serverWillStartResult === null ||
                typeof serverWillStartResult !== 'object' ||
                !('drainServer' in serverWillStartResult) ||
                typeof serverWillStartResult.drainServer !== 'function'
              ) {
                throw new Error('drainServer is undefined');
              }

              drainServerFn =
                serverWillStartResult.drainServer as () => Promise<void>;
            });

            it('should have drainServer method', () => {
              expect(drainServerFn).toBeDefined();
            });

            describe('when drainServer is called', () => {
              beforeAll(async () => {
                await drainServerFn();
              });

              afterAll(() => {
                vitest.clearAllMocks();
              });

              it('should call serverCleanup.dispose()', () => {
                expect(
                  serverCleanupMock.dispose,
                ).toHaveBeenCalledExactlyOnceWith();
              });
            });
          });
        });
      });
    });

    describe('when called with custom path option', () => {
      let optionsFixture: ApolloSubscriptionServerContainerModuleOptions;
      let containerModule: ApolloSubscriptionServerContainerModule;

      beforeAll(() => {
        optionsFixture = {
          path: '/custom-subscriptions',
        };

        containerModule = new ApolloSubscriptionServerContainerModule(
          optionsFixture,
        );
      });

      it('should return ApolloSubscriptionServerContainerModule', () => {
        expect(containerModule).toBeInstanceOf(
          ApolloSubscriptionServerContainerModule,
        );
      });
    });
  });
});
