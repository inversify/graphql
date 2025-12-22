import type http from 'node:http';

import { type ApolloServerPlugin, type BaseContext } from '@apollo/server';
import { type IResolvers, type TypeSource } from '@graphql-tools/utils';
import { type ServiceIdentifier } from 'inversify';

export interface ApolloServerInjectOptions<TContext extends BaseContext> {
  http?: {
    createServer?: <
      TRequest extends typeof http.IncomingMessage =
        typeof http.IncomingMessage,
      TResponse extends typeof http.ServerResponse<InstanceType<TRequest>> =
        typeof http.ServerResponse,
    >(
      requestListener?: http.RequestListener<TRequest, TResponse>,
    ) => http.Server<TRequest, TResponse>;
  };
  plugins?: ApolloServerPlugin<TContext>[] | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolverServiceIdentifier: ServiceIdentifier<IResolvers<any, TContext>>;
  typeDefs: TypeSource;
}
