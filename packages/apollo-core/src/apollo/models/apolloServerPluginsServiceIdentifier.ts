import { type ApolloServerPlugin } from '@apollo/server';
import { type ServiceIdentifier } from 'inversify';

export const apolloServerPluginsServiceIdentifier: ServiceIdentifier<
  ApolloServerPlugin[] | undefined
> = Symbol.for('@inversifyjs/apollo-core/ApolloServerPlugins');
