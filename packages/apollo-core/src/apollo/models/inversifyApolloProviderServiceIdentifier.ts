import { ServiceIdentifier } from 'inversify';

import { type InversifyApolloProvider } from '../modules/InversifyApolloProvider.js';

export const inversifyApolloProviderServiceIdentifier: ServiceIdentifier<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  InversifyApolloProvider<any>
> = Symbol.for('@inversifyjs/apollo-core/InversifyApolloProvider');
