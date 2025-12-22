import http from 'node:http';

import { type BaseContext } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import {
  ApolloServerContainerModule,
  apolloServerPluginsServiceIdentifier,
  apolloServerResolversServiceIdentifier,
  apolloServerTypeDefsServiceIdentifier,
} from '@inversifyjs/apollo-core';
import { httpApplicationServiceIdentifier } from '@inversifyjs/http-core';
import type express from 'express';
import { type ContainerModuleLoadOptions } from 'inversify';

import buildApolloServerExpressController from '../controllers/buildApolloServerExpressController.js';
import { ApolloServerExpressControllerOptions } from '../models/ApolloExpressControllerOptions.js';
import { ApolloServerInjectOptions } from '../models/ApolloServerInjectOptions.js';
import { httpServerServiceIdentifier } from '../models/httpServerServiceIdentifier.js';

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
          .bind(httpServerServiceIdentifier)
          .toResolvedValue(
            (application: express.Application) =>
              (serverOptions.http?.createServer ?? http.createServer)(
                application,
              ),
            [httpApplicationServiceIdentifier],
          );

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
          .toService(serverOptions.resolverServiceIdentifier);

        options
          .bind(apolloServerTypeDefsServiceIdentifier)
          .toConstantValue(serverOptions.typeDefs);
      },
    );
  }
}
