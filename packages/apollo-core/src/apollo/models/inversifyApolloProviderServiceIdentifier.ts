import { ServiceIdentifier } from 'inversify';

import { InversifyApolloProvider } from '../modules/InversifyApolloProvider';

export const inversifyApolloProviderServiceIdentifier: ServiceIdentifier<InversifyApolloProvider> =
  Symbol.for('@inversifyjs/apollo-core/InversifyApolloProvider');
