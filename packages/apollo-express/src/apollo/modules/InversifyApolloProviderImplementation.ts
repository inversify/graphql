import type http from 'node:http';

import { type ApolloServer } from '@apollo/server';
import {
  apolloServerServiceIdentifier,
  httpServerServiceIdentifier,
  type InversifyApolloProvider,
} from '@inversifyjs/apollo-core';
import { inject, injectable } from 'inversify';

@injectable()
export class InversifyApolloProviderImplementation implements InversifyApolloProvider<http.Server> {
  constructor(
    @inject(apolloServerServiceIdentifier) // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public readonly apolloServer: ApolloServer<any>,
    @inject(httpServerServiceIdentifier)
    public readonly server: http.Server,
  ) {}
}
