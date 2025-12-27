import http from 'node:http';

import { type BaseContext } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import {
  ApolloServerContainerModule,
  apolloServerPluginsServiceIdentifier,
  apolloServerResolversServiceIdentifier,
  apolloServerTypeDefsServiceIdentifier,
  httpServerServiceIdentifier,
} from '@inversifyjs/apollo-core';
import { httpApplicationServiceIdentifier } from '@inversifyjs/http-core';
import type express from 'express';
import { type ContainerModuleLoadOptions } from 'inversify';

import buildApolloServerExpressController from '../controllers/buildApolloServerExpressController.js';
import { ApolloExpressControllerOptions } from '../models/ApolloExpressControllerOptions.js';
import { ApolloServerInjectOptions } from '../models/ApolloServerInjectOptions.js';

export default class ApolloExpressServerContainerModule extends ApolloServerContainerModule {
  public static fromOptions<TContext extends BaseContext>(
    controllerOptions: ApolloExpressControllerOptions<TContext>,
    serverOptions: ApolloServerInjectOptions<TContext>,
  ): ApolloExpressServerContainerModule {
    return new ApolloExpressServerContainerModule(
      (options: ContainerModuleLoadOptions): void => {
        options
          .bind(buildApolloServerExpressController(controllerOptions))
          .toSelf()
          .inSingletonScope();

        options
          .bind(httpServerServiceIdentifier)
          .toResolvedValue(
            (application: express.Application) =>
              (serverOptions.http?.createServer ?? http.createServer)(
                application,
              ),
            [httpApplicationServiceIdentifier],
          )
          .inSingletonScope();

        options
          .bind(apolloServerPluginsServiceIdentifier)
          .toResolvedValue(
            (httpServer: http.Server) => [
              ...(serverOptions.plugins ?? []),
              ApolloServerPluginDrainHttpServer({ httpServer }),
            ],
            [httpServerServiceIdentifier],
          )
          .inSingletonScope();

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
