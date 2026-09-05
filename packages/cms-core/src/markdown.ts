import { fromMarkdown } from 'mdast-util-from-markdown';
import { toMarkdown } from 'mdast-util-to-markdown';
import { gfmFromMarkdown, gfmToMarkdown } from 'mdast-util-gfm';
import { gfm } from 'micromark-extension-gfm';

export type MarkdownRoot = ReturnType<typeof fromMarkdown>;

/** Parse included source with GFM so family tables survive the overlay include. */
export function parseGfmMarkdown(markdown: string): MarkdownRoot {
  return fromMarkdown(markdown, {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown()],
  });
}

export function stringifyGfmMarkdown(tree: MarkdownRoot): string {
  return toMarkdown(tree, { extensions: [gfmToMarkdown()] });
}
