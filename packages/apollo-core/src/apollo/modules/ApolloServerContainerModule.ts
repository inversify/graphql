import { ApolloServer, type ApolloServerPlugin } from '@apollo/server';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { type GraphQLResolverMap } from '@apollo/subgraph/dist/schema-helper/resolverMap.js';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { type IResolvers, type TypeSource } from '@graphql-tools/utils';
import { type GraphQLSchema } from 'graphql';
import { ContainerModule, type ContainerModuleLoadOptions } from 'inversify';

import { buildDocumentNodeFromTypeSource } from '../calcullations/buildDocumentNodeFromTypeSource.js';
import { ApolloServerContainerModuleOptions } from '../models/ApolloServerContainerModuleOptions.js';
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
    containerModuleOptions?: ApolloServerContainerModuleOptions,
  ) {
    super((options: ContainerModuleLoadOptions): void | Promise<void> => {
      if (containerModuleOptions?.isSubgraph === true) {
        options
          .bind(apolloServerGraphqlServiceIdentifier)
          .toResolvedValue(
            (resolvers: IResolvers, typeDefs: TypeSource): GraphQLSchema =>
              buildSubgraphSchema({
                resolvers: resolvers as GraphQLResolverMap<unknown>,
                typeDefs: buildDocumentNodeFromTypeSource(typeDefs),
              }),
            [
              apolloServerResolversServiceIdentifier,
              apolloServerTypeDefsServiceIdentifier,
            ],
          )
          .inSingletonScope();
      } else {
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
      }

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
