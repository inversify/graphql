import { mergeTypeDefs } from '@graphql-tools/merge';
import { type TypeSource } from '@graphql-tools/utils';
import { type DocumentNode, parse } from 'graphql';

export function buildDocumentNodeFromTypeSource(
  typeDefs: TypeSource,
): DocumentNode {
  return typeof typeDefs === 'string'
    ? parse(typeDefs)
    : mergeTypeDefs(typeDefs);
}
