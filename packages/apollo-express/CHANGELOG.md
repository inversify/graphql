# @inversifyjs/apollo-express

## 0.8.2

### Patch Changes

- Updated dependencies
  - @inversifyjs/apollo-core@0.7.2

## 0.8.1

### Patch Changes

- Updated compiled files without `tslib` imports
- Updated dependencies
  - @inversifyjs/apollo-core@0.7.1

## 0.8.0

### Minor Changes

- Updated package to rely on inversify@8 ecosystem packages

### Patch Changes

- Updated dependencies
  - @inversifyjs/apollo-core@0.7.0

## 0.7.0

### Minor Changes

- Updated container module with graph and subgraph builders

### Patch Changes

- Updated dependencies
  - @inversifyjs/apollo-core@0.6.0

## 0.6.0

### Minor Changes

- Renamed `ApolloExpressServerContainerModule.forOptions` to `fromOptions`
- Updated `InversifyApolloProvider` with generic type
  Renamed `ApolloServerExpressControllerOptions` to `ApolloExpressControllerOptions`

### Patch Changes

- Updated dependencies
  - @inversifyjs/apollo-core@0.5.0

## 0.5.1

### Patch Changes

- Updated dependencies
  - @inversifyjs/apollo-core@0.4.0

## 0.5.0

### Minor Changes

Removed `httpServerServiceIdentifier`

### Patch Changes

- Updated dependencies
  - @inversifyjs/apollo-core@0.3.0

## 0.4.0

### Minor Changes

- Removed `ApolloServerInjectOptions.resolvers` in favor of `resolverServiceIdentifier`

## 0.3.0

### Minor Changes

- Added `httpServerServiceIdentifier`

## 0.2.0

### Minor Changes

- Added `buildApolloServerExpressController`

### Patch Changes

- Updated dependencies
  - @inversifyjs/apollo-core@0.2.0
