import { type ApolloServer } from '@apollo/server';
import {
  apolloServerServiceIdentifier,
  InversifyApolloProvider,
} from '@inversifyjs/apollo-core';
import { httpApplicationServiceIdentifier } from '@inversifyjs/http-core';
import { type FastifyInstance } from 'fastify';
import { inject, injectable } from 'inversify';

@injectable()
export class InversifyApolloProviderImplementation implements InversifyApolloProvider<FastifyInstance> {
  constructor(
    // This way ensure Apollo server is initialized
    @inject(apolloServerServiceIdentifier)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public readonly apolloServer: ApolloServer<any>,
    @inject(httpApplicationServiceIdentifier)
    public readonly server: FastifyInstance,
  ) {}
}
