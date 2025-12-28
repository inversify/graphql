import { type ApolloServerPlugin, type BaseContext } from '@apollo/server';
import { type IResolvers, type TypeSource } from '@graphql-tools/utils';
import { type ServiceIdentifier } from 'inversify';

export interface ApolloServerInjectOptions<TContext extends BaseContext> {
  plugins?: ApolloServerPlugin<TContext>[] | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolverServiceIdentifier: ServiceIdentifier<IResolvers<any, TContext>>;
  typeDefs: TypeSource;
}
