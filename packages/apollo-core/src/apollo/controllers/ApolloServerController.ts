import { BaseContext } from '@apollo/server';

export abstract class ApolloServerController<
  TContext extends BaseContext = BaseContext,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unnecessary-type-parameters
  TContextArgs extends unknown[] = any[],
> {
  protected abstract _getContext(...args: TContextArgs): Promise<TContext>;
}
