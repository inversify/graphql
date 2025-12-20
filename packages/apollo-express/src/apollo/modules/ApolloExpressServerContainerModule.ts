import type http from 'node:http';

import { type BaseContext } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import {
  ApolloServerContainerModule,
  apolloServerPluginsServiceIdentifier,
  apolloServerResolversServiceIdentifier,
  apolloServerTypeDefsServiceIdentifier,
} from '@inversifyjs/apollo-core';
import { httpServerServiceIdentifier } from '@inversifyjs/http-core';
import { type ContainerModuleLoadOptions } from 'inversify';

import buildApolloServerExpressController from '../controllers/buildApolloServerExpressController.js';
import { ApolloServerExpressControllerOptions } from '../models/ApolloExpressControllerOptions.js';
import { ApolloServerInjectOptions } from '../models/ApolloServerInjectOptions.js';

export default class ApolloExpressServerContainerModule extends ApolloServerContainerModule {
  public static forOptions<TContext extends BaseContext>(
    controllerOptions: ApolloServerExpressControllerOptions<TContext>,
    serverOptions: ApolloServerInjectOptions<TContext>,
  ): ApolloExpressServerContainerModule {
    return new ApolloExpressServerContainerModule(
      (options: ContainerModuleLoadOptions): void => {
        options
          .bind(buildApolloServerExpressController(controllerOptions))
          .toSelf();

        options
          .bind(apolloServerPluginsServiceIdentifier)
          .toResolvedValue(
            (httpServer: http.Server) => [
              ...(serverOptions.plugins ?? []),
              ApolloServerPluginDrainHttpServer({ httpServer }),
            ],
            [httpServerServiceIdentifier],
          );

        options
          .bind(apolloServerResolversServiceIdentifier)
          .toConstantValue(serverOptions.resolvers);

        options
          .bind(apolloServerTypeDefsServiceIdentifier)
          .toConstantValue(serverOptions.typeDefs);
      },
    );
  }
}
