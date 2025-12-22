import type http from 'node:http';

import { type ServiceIdentifier } from 'inversify';

export const httpServerServiceIdentifier: ServiceIdentifier<http.Server> =
  Symbol.for('@inversifyjs/apollo-express/HttpServer');
