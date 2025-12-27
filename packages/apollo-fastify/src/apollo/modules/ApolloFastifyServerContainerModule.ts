import http from 'node:http';

import { type BaseContext } from '@apollo/server';
import { fastifyApolloDrainPlugin } from '@as-integrations/fastify';
import {
  ApolloServerContainerModule,
  apolloServerPluginsServiceIdentifier,
  apolloServerResolversServiceIdentifier,
  apolloServerTypeDefsServiceIdentifier,
  httpServerServiceIdentifier,
} from '@inversifyjs/apollo-core';
import { httpApplicationServiceIdentifier } from '@inversifyjs/http-core';
import { type FastifyInstance } from 'fastify';
import { type ContainerModuleLoadOptions } from 'inversify';

import buildApolloServerFastifyController from '../controllers/buildApolloServerFastifyController.js';
import { ApolloFastifyControllerOptions } from '../models/ApolloFastifyControllerOptions.js';
import { ApolloServerInjectOptions } from '../models/ApolloServerInjectOptions.js';

export default class ApolloFastifyServerContainerModule extends ApolloServerContainerModule {
  public static fromOptions<TContext extends BaseContext>(
    controllerOptions: ApolloFastifyControllerOptions<TContext>,
    serverOptions: ApolloServerInjectOptions<TContext>,
  ): ApolloFastifyServerContainerModule {
    return new ApolloFastifyServerContainerModule(
      (options: ContainerModuleLoadOptions): void => {
        options
          .bind(buildApolloServerFastifyController(controllerOptions))
          .toSelf()
          .inSingletonScope();

        options
          .bind(httpServerServiceIdentifier)
          .toResolvedValue(
            (instance: FastifyInstance): http.Server => instance.server,
            [httpApplicationServiceIdentifier],
          )
          .inSingletonScope();

        options
          .bind(apolloServerPluginsServiceIdentifier)
          .toResolvedValue(
            (instance: FastifyInstance) => [
              ...(serverOptions.plugins ?? []),
              fastifyApolloDrainPlugin(instance),
            ],
            [httpApplicationServiceIdentifier],
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
