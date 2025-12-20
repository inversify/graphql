import { type ApolloServerPlugin, type BaseContext } from '@apollo/server';
import { type IResolvers, type TypeSource } from '@graphql-tools/utils';

export interface ApolloServerInjectOptions<TContext extends BaseContext> {
  plugins?: ApolloServerPlugin<TContext>[] | undefined;
  resolvers: IResolvers<TContext>;
  typeDefs: TypeSource;
}
