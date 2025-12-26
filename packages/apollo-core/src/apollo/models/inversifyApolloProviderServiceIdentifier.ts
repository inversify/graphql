import { ServiceIdentifier } from 'inversify';

import { type InversifyApolloProvider } from '../modules/InversifyApolloProvider.js';

export const inversifyApolloProviderServiceIdentifier: ServiceIdentifier<InversifyApolloProvider> =
  Symbol.for('@inversifyjs/apollo-core/InversifyApolloProvider');
