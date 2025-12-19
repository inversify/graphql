import { type ApolloServer } from '@apollo/server';
import { type ServiceIdentifier } from 'inversify';

export const apolloServerServiceIdentifier: ServiceIdentifier<
  Promise<ApolloServer>
> = Symbol.for('@inversifyjs/apollo-core/apolloServer');
