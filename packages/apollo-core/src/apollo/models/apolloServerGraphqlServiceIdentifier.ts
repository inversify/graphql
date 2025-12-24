import { type GraphQLSchema } from 'graphql';
import { type ServiceIdentifier } from 'inversify';

export const apolloServerGraphqlServiceIdentifier: ServiceIdentifier<GraphQLSchema> =
  Symbol.for('@inversifyjs/apollo-core/ApolloServerGraphql');
