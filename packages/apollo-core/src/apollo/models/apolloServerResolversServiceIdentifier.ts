import { type IResolvers } from '@graphql-tools/utils';
import { type ServiceIdentifier } from 'inversify';

export const apolloServerResolversServiceIdentifier: ServiceIdentifier<IResolvers> =
  Symbol.for('@inversifyjs/apollo-core/ApolloServerResolvers');
