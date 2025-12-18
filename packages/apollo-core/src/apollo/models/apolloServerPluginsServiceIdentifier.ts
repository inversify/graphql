import { type ApolloServerPlugin } from '@apollo/server';
import { type ServiceIdentifier } from 'inversify';

export const apolloServerPluginsServiceIdentifier: ServiceIdentifier<
  ApolloServerPlugin[]
> = Symbol.for('@inversifyjs/apollo-core/ApolloServerPlugins');
