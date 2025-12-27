import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { type AddressInfo } from 'node:net';

import { type BaseContext } from '@apollo/server';
import { type ApolloFastifyContextFunctionArgument } from '@as-integrations/fastify';
import { type IResolvers, type TypeSource } from '@graphql-tools/utils';
import {
  ApolloServerContainerModule,
  apolloServerResolversServiceIdentifier,
  apolloServerTypeDefsServiceIdentifier,
} from '@inversifyjs/apollo-core';
import { InversifyFastifyHttpAdapter } from '@inversifyjs/http-fastify';
import { FastifyInstance } from 'fastify';
import { Container, type ContainerModuleLoadOptions } from 'inversify';

import buildApolloServerFastifyController from './buildApolloServerFastifyController.js';

describe(buildApolloServerFastifyController, () => {
  describe('having an http server with an ApolloServerFastifyController', () => {
    let server: FastifyInstance;
    let port: number;

    beforeAll(async () => {
      const graphQlSchema: TypeSource = `
type RootQuery {
  hello: String!
}

schema {
  query: RootQuery
}
`;

      const graphqlResolver: IResolvers = {
        RootQuery: { hello: () => 'world' },
      };

      const containerModule: ApolloServerContainerModule =
        new ApolloServerContainerModule(
          (options: ContainerModuleLoadOptions): void => {
            options
              .bind(apolloServerResolversServiceIdentifier)
              .toConstantValue(graphqlResolver);
            options
              .bind(apolloServerTypeDefsServiceIdentifier)
              .toConstantValue(graphQlSchema);
          },
        );

      const container: Container = new Container();

      await container.load(containerModule);

      container
        .bind(
          buildApolloServerFastifyController({
            getContext: async (
              _args: ApolloFastifyContextFunctionArgument,
            ): Promise<BaseContext> => ({}),
          }),
        )
        .toSelf()
        .inSingletonScope();

      const adapter: InversifyFastifyHttpAdapter =
        new InversifyFastifyHttpAdapter(container);

      server = await adapter.build();

      await server.listen({ host: '0.0.0.0', port: 0 });

      port = (server.server.address() as AddressInfo).port;
    });

    afterAll(async () => {
      await server.close();
    });

    describe('when sending a request to the server', () => {
      let result: unknown;

      beforeAll(async () => {
        const query: string = '{ hello }';

        const response: Response = await fetch(
          `http://localhost:${port.toString()}`,
          {
            body: JSON.stringify({ query }),
            headers: {
              'Content-Type': 'application/json',
            },
            method: 'POST',
          },
        );

        result = await response.json();
      });

      it('should return expected value', () => {
        expect(result).toStrictEqual({
          data: {
            hello: 'world',
          },
        });
      });
    });
  });
});
