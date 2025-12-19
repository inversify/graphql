import { ApolloServer, type BaseContext } from '@apollo/server';
import {
  ExpressContextFunctionArgument,
  expressMiddleware,
} from '@as-integrations/express5';
import {
  ApolloServerController,
  apolloServerServiceIdentifier,
} from '@inversifyjs/apollo-core';
import {
  Controller,
  ControllerOptions,
  Next,
  Post,
  Request,
  Response,
} from '@inversifyjs/http-core';
import type express from 'express';
import { inject, Newable } from 'inversify';

export interface BuildApolloServerExpressControllerOptions<
  TContext extends BaseContext,
> {
  controllerOptions?: string | ControllerOptions | undefined;
  getContext: (arg: ExpressContextFunctionArgument) => Promise<TContext>;
}

export function buildApolloServerExpressController<
  TContext extends BaseContext = BaseContext,
>(
  options: BuildApolloServerExpressControllerOptions<TContext>,
): Newable<ApolloServerController<TContext, [ExpressContextFunctionArgument]>> {
  @Controller(options.controllerOptions)
  class ApolloServerExpressController extends ApolloServerController<
    TContext,
    [ExpressContextFunctionArgument]
  > {
    readonly #middleware: express.RequestHandler;

    constructor(
      @inject(apolloServerServiceIdentifier)
      apolloServer: ApolloServer<TContext>,
    ) {
      super();

      this.#middleware = expressMiddleware<TContext>(apolloServer, {
        context: this._getContext.bind(this),
      });
    }

    @Post()
    public async handleRequest(
      @Request()
      req: express.Request,
      @Response()
      res: express.Response,
      @Next()
      next: express.NextFunction,
    ) {
      return this.#middleware(req, res, next);
    }

    protected async _getContext(
      arg: ExpressContextFunctionArgument,
    ): Promise<TContext> {
      return options.getContext(arg);
    }
  }

  return ApolloServerExpressController;
}
