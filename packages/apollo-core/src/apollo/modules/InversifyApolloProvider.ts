import type http from 'node:http';

import { type ApolloServer } from '@apollo/server';

export interface InversifyApolloProvider {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly apolloServer: ApolloServer<any>;

  readonly httpServer: http.Server;
}
