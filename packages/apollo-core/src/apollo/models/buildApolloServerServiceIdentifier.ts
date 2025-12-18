import type http from 'node:http';
import type https from 'node:https';

import { type ApolloServer } from '@apollo/server';
import { type ServiceIdentifier } from 'inversify';

export const buildApolloServerServiceIdentifier: ServiceIdentifier<
  (httpServer: http.Server | https.Server) => Promise<ApolloServer>
> = Symbol.for('@inversifyjs/apollo-core/buildApolloServer');
