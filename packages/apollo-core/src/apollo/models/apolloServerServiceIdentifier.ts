import { type ApolloServer } from '@apollo/server';
import { type ServiceIdentifier } from 'inversify';

export const apolloServerServiceIdentifier: ServiceIdentifier<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ApolloServer<any>
> = Symbol.for('@inversifyjs/apollo-core/apolloServer');
