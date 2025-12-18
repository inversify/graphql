import { type TypeSource } from '@graphql-tools/utils';
import { type ServiceIdentifier } from 'inversify';

export const apolloServerTypeDefsServiceIdentifier: ServiceIdentifier<TypeSource> =
  Symbol.for('@inversifyjs/apollo-core/ApolloServerTypeDefs');
