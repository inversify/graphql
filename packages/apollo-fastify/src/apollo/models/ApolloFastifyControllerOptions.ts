import { type BaseContext } from '@apollo/server';
import { type ApolloFastifyContextFunctionArgument } from '@as-integrations/fastify';
import { type ControllerOptions } from '@inversifyjs/http-core';

export interface ApolloFastifyControllerOptions<TContext extends BaseContext> {
  controllerOptions?: string | ControllerOptions | undefined;
  getContext: (arg: ApolloFastifyContextFunctionArgument) => Promise<TContext>;
}
