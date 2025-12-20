import { type BaseContext } from '@apollo/server';
import { type ExpressContextFunctionArgument } from '@as-integrations/express5';
import { type ControllerOptions } from '@inversifyjs/http-core';

export interface ApolloServerExpressControllerOptions<
  TContext extends BaseContext,
> {
  controllerOptions?: string | ControllerOptions | undefined;
  getContext: (arg: ExpressContextFunctionArgument) => Promise<TContext>;
}
