import { type ServiceIdentifier } from 'inversify';
import { type WebSocketServer } from 'ws';

export const wsServerServiceIdentifier: ServiceIdentifier<WebSocketServer> =
  Symbol.for('@inversifyjs/apollo-subscription-ws/WsServer');
