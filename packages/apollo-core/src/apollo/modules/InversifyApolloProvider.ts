import { type ApolloServer } from '@apollo/server';

export interface InversifyApolloProvider<TServer> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly apolloServer: ApolloServer<any>;

  readonly server: TServer;
}
