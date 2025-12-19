import { ApolloServer, type ApolloServerPlugin } from '@apollo/server';
import { type IResolvers, type TypeSource } from '@graphql-tools/utils';
import { ContainerModule, type ContainerModuleLoadOptions } from 'inversify';

import { apolloServerPluginsServiceIdentifier } from '../models/apolloServerPluginsServiceIdentifier.js';
import { apolloServerResolversServiceIdentifier } from '../models/apolloServerResolversServiceIdentifier.js';
import { apolloServerServiceIdentifier } from '../models/apolloServerServiceIdentifier.js';
import { apolloServerTypeDefsServiceIdentifier } from '../models/apolloServerTypeDefsServiceIdentifier.js';

export class ApolloServerContainerModule extends ContainerModule {
  constructor(
    load?:
      | ((options: ContainerModuleLoadOptions) => void | Promise<void>)
      | undefined,
  ) {
    super((options: ContainerModuleLoadOptions): void | Promise<void> => {
      options.bind(apolloServerServiceIdentifier).toResolvedValue(
        async (
          plugins: ApolloServerPlugin[] | undefined,
          resolvers: IResolvers,
          typeDefs: TypeSource,
        ): Promise<ApolloServer> => {
          const apolloServer: ApolloServer = new ApolloServer({
            plugins: plugins ?? [],
            resolvers,
            typeDefs,
          });

          await apolloServer.start();

          return apolloServer;
        },
        [
          {
            optional: true,
            serviceIdentifier: apolloServerPluginsServiceIdentifier,
          },
          apolloServerResolversServiceIdentifier,
          apolloServerTypeDefsServiceIdentifier,
        ],
      );

      return load?.(options);
    });
  }
}
