import type http from 'node:http';

import { type ApolloServer } from '@apollo/server';
import { inject, injectable } from 'inversify';

import { apolloServerServiceIdentifier } from '../models/apolloServerServiceIdentifier.js';
import { httpServerServiceIdentifier } from '../models/httpServerServiceIdentifier.js';
import { type InversifyApolloProvider } from './InversifyApolloProvider.js';

@injectable()
export class InversifyApolloProviderImplementation implements InversifyApolloProvider {
  constructor(
    @inject(apolloServerServiceIdentifier) // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public readonly apolloServer: ApolloServer<any>,
    @inject(httpServerServiceIdentifier)
    public readonly httpServer: http.Server,
  ) {}
}
