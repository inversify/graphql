import { type ApolloServerPlugin } from '@apollo/server';
import { type ServiceIdentifier } from 'inversify';

export const apolloServerPluginsServiceIdentifier: ServiceIdentifier<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ApolloServerPlugin<any>[] | undefined
> = Symbol.for('@inversifyjs/apollo-core/ApolloServerPlugins');
