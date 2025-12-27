import { ApolloServer, type BaseContext } from '@apollo/server';
import {
  ApolloFastifyContextFunctionArgument,
  fastifyApolloHandler,
} from '@as-integrations/fastify';
import {
  ApolloServerController,
  apolloServerServiceIdentifier,
} from '@inversifyjs/apollo-core';
import {
  Controller,
  httpApplicationServiceIdentifier,
  Post,
  Request,
  Response,
} from '@inversifyjs/http-core';
import {
  type FastifyInstance,
  type FastifyReply,
  type FastifyRequest,
  type RouteHandlerMethod,
} from 'fastify';
import { inject, Newable } from 'inversify';

import { ApolloFastifyControllerOptions } from '../models/ApolloFastifyControllerOptions.js';

export default function buildApolloServerFastifyController<
  TContext extends BaseContext = BaseContext,
>(
  options: ApolloFastifyControllerOptions<TContext>,
): Newable<
  ApolloServerController<TContext, [ApolloFastifyContextFunctionArgument]>,
  [ApolloServer<TContext>, FastifyInstance]
> {
  @Controller(options.controllerOptions)
  class ApolloServerFastifyController extends ApolloServerController<
    TContext,
    [ApolloFastifyContextFunctionArgument]
  > {
    readonly #fastifyInstance: FastifyInstance;
    readonly #middleware: RouteHandlerMethod;

    constructor(
      @inject(apolloServerServiceIdentifier)
      apolloServer: ApolloServer<TContext>,
      @inject(httpApplicationServiceIdentifier)
      fastifyInstance: FastifyInstance,
    ) {
      super();

      this.#fastifyInstance = fastifyInstance;

      this.#middleware = fastifyApolloHandler<TContext>(apolloServer, {
        context: this.#getContextFromSpreadArgs.bind(this),
      }) as RouteHandlerMethod;
    }

    @Post()
    public async handleRequest(
      @Request()
      req: FastifyRequest,
      @Response()
      res: FastifyReply,
    ): Promise<void> {
      const result: unknown = await this.#middleware.call(
        this.#fastifyInstance,
        req,
        res,
      );

      if (!res.sent) {
        await res.send(result);
      }
    }

    protected async _getContext(
      arg: ApolloFastifyContextFunctionArgument,
    ): Promise<TContext> {
      return options.getContext(arg);
    }

    async #getContextFromSpreadArgs(
      ...args: ApolloFastifyContextFunctionArgument
    ): Promise<TContext> {
      return this._getContext(args);
    }
  }

  return ApolloServerFastifyController;
}
