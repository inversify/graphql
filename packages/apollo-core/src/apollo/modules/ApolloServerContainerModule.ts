import { ApolloServer, type ApolloServerPlugin } from '@apollo/server';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { type IResolvers, type TypeSource } from '@graphql-tools/utils';
import { type GraphQLSchema } from 'graphql';
import { ContainerModule, type ContainerModuleLoadOptions } from 'inversify';

import { apolloServerGraphqlServiceIdentifier } from '../models/apolloServerGraphqlServiceIdentifier.js';
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
      options
        .bind(apolloServerGraphqlServiceIdentifier)
        .toResolvedValue(
          (resolvers: IResolvers, typeDefs: TypeSource): GraphQLSchema =>
            makeExecutableSchema({ resolvers, typeDefs }),
          [
            apolloServerResolversServiceIdentifier,
            apolloServerTypeDefsServiceIdentifier,
          ],
        )
        .inSingletonScope();
      options
        .bind(apolloServerServiceIdentifier)
        .toResolvedValue(
          async (
            plugins: ApolloServerPlugin[][],
            schema: GraphQLSchema,
          ): Promise<ApolloServer> => {
            const apolloServer: ApolloServer = new ApolloServer({
              plugins: plugins.flat(),
              schema,
            });

            await apolloServer.start();

            return apolloServer;
          },
          [
            {
              isMultiple: true,
              serviceIdentifier: apolloServerPluginsServiceIdentifier,
            },
            apolloServerGraphqlServiceIdentifier,
          ],
        )
        .inSingletonScope();

      return load?.(options);
    });
  }
}
