import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import type http from 'node:http';

import { BaseContext } from '@apollo/server';
import { type ExpressContextFunctionArgument } from '@as-integrations/express5';
import { type IResolvers, type TypeSource } from '@graphql-tools/utils';
import { httpServerServiceIdentifier } from '@inversifyjs/apollo-core';
import { ApolloExpressServerContainerModule } from '@inversifyjs/apollo-express';
import { InversifyExpressHttpAdapter } from '@inversifyjs/http-express';
import { Container, ServiceIdentifier } from 'inversify';
import { WebSocket, WebSocketServer } from 'ws';

import { wsServerServiceIdentifier } from '../models/wsServerServiceIdentifier.js';
import { ApolloSubscriptionServerContainerModule } from './ApolloSubscriptionServerContainerModule.js';

describe(ApolloSubscriptionServerContainerModule, () => {
  describe('having an http server with an ApolloServerExpressController', () => {
    let httpServer: http.Server;
    let httpServerPort: number;
    let wsServer: WebSocketServer;

    beforeAll(async () => {
      const graphQlSchema: TypeSource = `
type RootQuery {
  hello: String!
}

schema {
  query: RootQuery
  subscription: RootSubscription
}

type RootSubscription {
  subscribeHello: RootQuery!
}
`;

      const graphqlResolver: IResolvers = {
        RootQuery: { hello: () => 'world' },
        RootSubscription: {
          subscribeHello: {
            subscribe: async function* () {
              yield { subscribeHello: { hello: 'world' } };
              yield { subscribeHello: { hello: 'world' } };
            },
          },
        },
      };

      const resolverServiceIdentifier: ServiceIdentifier<IResolvers> = Symbol();

      const containerModule: ApolloExpressServerContainerModule =
        ApolloExpressServerContainerModule.forOptions(
          {
            getContext: async (
              _args: ExpressContextFunctionArgument,
            ): Promise<BaseContext> => ({}),
          },
          {
            resolverServiceIdentifier,
            typeDefs: graphQlSchema,
          },
        );

      const subscriptionContainerModule: ApolloSubscriptionServerContainerModule =
        new ApolloSubscriptionServerContainerModule({
          path: '/subscriptions',
        });

      const container: Container = new Container();

      container
        .bind(resolverServiceIdentifier)
        .toConstantValue(graphqlResolver);

      await container.load(containerModule, subscriptionContainerModule);

      const adapter: InversifyExpressHttpAdapter =
        new InversifyExpressHttpAdapter(container);

      await adapter.build();

      httpServer = await container.getAsync(httpServerServiceIdentifier);

      await new Promise<void>((resolve: () => void) => {
        httpServer.listen(() => {
          resolve();
        });
      });

      httpServerPort = (httpServer.address() as { port: number }).port;

      wsServer = await container.getAsync(wsServerServiceIdentifier);
    });

    afterAll(() => {
      wsServer.close();
      httpServer.close();
    });

    describe('when sending a request to the server', () => {
      let result: unknown;

      beforeAll(async () => {
        const query: string = '{ hello }';

        const response: Response = await fetch(
          `http://localhost:${httpServerPort.toString()}`,
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

    describe('when connecting via WebSocket to test subscription', () => {
      let wsClient: WebSocket;
      let subscriptionResults: unknown[];

      beforeAll(async () => {
        subscriptionResults = [];

        wsClient = new WebSocket(
          `ws://localhost:${httpServerPort.toString()}/subscriptions`,
          'graphql-transport-ws',
        );

        await new Promise<void>(
          (resolve: () => void, reject: (reason?: unknown) => void) => {
            wsClient.on('open', () => {
              resolve();
            });
            wsClient.on('error', (error: Error) => {
              reject(error);
            });
          },
        );

        // Send connection init
        wsClient.send(JSON.stringify({ type: 'connection_init' }));

        // Wait for connection ack
        await new Promise<void>((resolve: () => void) => {
          wsClient.once('message', (data: Buffer) => {
            const message: { type?: string } = JSON.parse(data.toString()) as {
              type?: string;
            };
            if (message.type === 'connection_ack') {
              resolve();
            }
          });
        });

        // Subscribe to the subscription
        const subscriptionMessage: {
          id: string;
          payload: { query: string };
          type: string;
        } = {
          id: '1',
          payload: {
            query: 'subscription { subscribeHello { hello } }',
          },
          type: 'subscribe',
        };

        wsClient.send(JSON.stringify(subscriptionMessage));

        // Collect subscription results
        await new Promise<void>((resolve: () => void) => {
          let receivedCount: number = 0;
          wsClient.on('message', (data: Buffer) => {
            const message: { type?: string; payload?: unknown } = JSON.parse(
              data.toString(),
            ) as { type?: string; payload?: unknown };
            if (message.type === 'next') {
              subscriptionResults.push(message.payload);
              receivedCount++;
              if (receivedCount === 2) {
                resolve();
              }
            } else if (message.type === 'complete') {
              resolve();
            }
          });
        });
      });

      afterAll(() => {
        wsClient.close();
      });

      it('should receive subscription data', () => {
        expect(subscriptionResults).toHaveLength(2);
        expect(subscriptionResults[0]).toStrictEqual({
          data: {
            subscribeHello: {
              hello: 'world',
            },
          },
        });
        expect(subscriptionResults[1]).toStrictEqual({
          data: {
            subscribeHello: {
              hello: 'world',
            },
          },
        });
      });
    });
  });
});
