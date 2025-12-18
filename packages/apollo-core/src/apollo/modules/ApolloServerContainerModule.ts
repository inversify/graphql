import type http from 'node:http';
import type https from 'node:https';

import { ApolloServer, type ApolloServerPlugin } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { type IResolvers, type TypeSource } from '@graphql-tools/utils';
import { ContainerModule, type ContainerModuleLoadOptions } from 'inversify';

import { apolloServerPluginsServiceIdentifier } from '../models/apolloServerPluginsServiceIdentifier.js';
import { apolloServerResolversServiceIdentifier } from '../models/apolloServerResolversServiceIdentifier.js';
import { apolloServerTypeDefsServiceIdentifier } from '../models/apolloServerTypeDefsServiceIdentifier.js';
import { buildApolloServerServiceIdentifier } from '../models/buildApolloServerServiceIdentifier.js';

export class ApolloServerContainerModule extends ContainerModule {
  constructor(
    load?:
      | ((options: ContainerModuleLoadOptions) => void | Promise<void>)
      | undefined,
  ) {
    super((options: ContainerModuleLoadOptions): void | Promise<void> => {
      options.bind(buildApolloServerServiceIdentifier).toResolvedValue(
        (
          plugins: ApolloServerPlugin[],
          resolvers: IResolvers,
          typeDefs: TypeSource,
        ) =>
          async (
            httpServer: http.Server | https.Server,
          ): Promise<ApolloServer> => {
            const apolloServer: ApolloServer = new ApolloServer({
              plugins: [
                ...plugins,
                ApolloServerPluginDrainHttpServer({ httpServer }),
              ],
              resolvers,
              typeDefs,
            });

            await apolloServer.start();

            return apolloServer;
          },
        [
          apolloServerPluginsServiceIdentifier,
          apolloServerResolversServiceIdentifier,
          apolloServerTypeDefsServiceIdentifier,
        ],
      );

      return load?.(options);
    });
  }
}
