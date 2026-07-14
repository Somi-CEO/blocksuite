import type { BlockStdScope, ExtensionType } from '@blocksuite/block-std';
import type { IVec } from '@blocksuite/global/utils';

import { createIdentifier } from '@blocksuite/global/di';

/**
 * Optional override for edgeless toolbar / clipboard / image+attachment
 * services that call `addImages` / `addAttachments`. Host apps (e.g. Somi)
 * register this via DI so product media ingest runs without Vite aliases.
 */
export interface EdgelessFileIngest {
  addImages: (
    std: BlockStdScope,
    files: File[],
    point?: IVec
  ) => Promise<string[]>;
  addAttachments: (
    std: BlockStdScope,
    files: File[],
    point?: IVec
  ) => Promise<string[]>;
}

export const EdgelessFileIngestProvider =
  createIdentifier<EdgelessFileIngest>('EdgelessFileIngest');

export function EdgelessFileIngestExtension(
  service: EdgelessFileIngest
): ExtensionType {
  return {
    setup: di => {
      di.addImpl(EdgelessFileIngestProvider, service);
    },
  };
}
