import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import type http from 'node:http';

import { BaseContext } from '@apollo/server';
import { ExpressContextFunctionArgument } from '@as-integrations/express5';
import { type IResolvers, type TypeSource } from '@graphql-tools/utils';
import {
  ApolloServerContainerModule,
  ApolloServerController,
  apolloServerResolversServiceIdentifier,
  apolloServerTypeDefsServiceIdentifier,
} from '@inversifyjs/apollo-core';
import { InversifyExpressHttpAdapter } from '@inversifyjs/http-express';
import express from 'express';
import { Container, ContainerModuleLoadOptions, Newable } from 'inversify';

import buildApolloServerExpressController from './buildApolloServerExpressController.js';

describe(buildApolloServerExpressController, () => {
  describe('having an http server with an ApolloServerExpressController', () => {
    let server: http.Server;
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

      const controller: Newable<ApolloServerController> =
        buildApolloServerExpressController({
          getContext: async (
            _args: ExpressContextFunctionArgument,
          ): Promise<BaseContext> => ({}),
        });

      container.bind(controller).toSelf();

      const adapter: InversifyExpressHttpAdapter =
        new InversifyExpressHttpAdapter(container);

      const expressApp: express.Application = await adapter.build();

      server = expressApp.listen();
      port = (server.address() as { port: number }).port;
    });

    afterAll(() => {
      server.close();
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
