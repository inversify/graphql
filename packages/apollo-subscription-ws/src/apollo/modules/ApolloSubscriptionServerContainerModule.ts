import type http from 'node:http';

import { type ApolloServerPlugin } from '@apollo/server';
import {
  apolloServerGraphqlServiceIdentifier,
  apolloServerPluginsServiceIdentifier,
  httpServerServiceIdentifier,
} from '@inversifyjs/apollo-core';
import { type GraphQLSchema } from 'graphql';
import { useServer } from 'graphql-ws/use/ws';
import { ContainerModule, type ContainerModuleLoadOptions } from 'inversify';
import { WebSocketServer } from 'ws';

import { type ApolloSubscriptionServerContainerModuleOptions } from '../models/ApolloSubscriptionServerContainerModuleOptions.js';
import { wsServerServiceIdentifier } from '../models/wsServerServiceIdentifier.js';

export class ApolloSubscriptionServerContainerModule extends ContainerModule {
  constructor(options?: ApolloSubscriptionServerContainerModuleOptions) {
    super((loadOptions: ContainerModuleLoadOptions): void => {
      loadOptions
        .bind(wsServerServiceIdentifier)
        .toResolvedValue(
          (httpServer: http.Server): WebSocketServer =>
            new WebSocketServer({
              path: options?.path ?? '/subscriptions',
              server: httpServer,
            }),
          [httpServerServiceIdentifier],
        )
        .inSingletonScope();

      loadOptions
        .bind(apolloServerPluginsServiceIdentifier)
        .toResolvedValue(
          (
            graphqlSchema: GraphQLSchema,
            wsServer: WebSocketServer,
          ): ApolloServerPlugin[] => {
            // eslint-disable-next-line @typescript-eslint/typedef
            const serverCleanup = useServer(
              { schema: graphqlSchema },
              wsServer,
            );

            return [
              {
                async serverWillStart() {
                  return {
                    async drainServer() {
                      await serverCleanup.dispose();
                    },
                  };
                },
              },
            ];
          },
          [apolloServerGraphqlServiceIdentifier, wsServerServiceIdentifier],
        )
        .inSingletonScope();
    });
  }
}
