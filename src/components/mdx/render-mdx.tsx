import type { ReactElement } from 'react';
import { compileMDX } from 'next-mdx-remote/rsc';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import { mdxComponents } from './mdx-components';

/** Compiles MDX source (no frontmatter) to React with the site's component map. */
export async function renderMdx(source: string): Promise<ReactElement> {
  const { content } = await compileMDX({
    source,
    components: mdxComponents,
    options: {
      mdxOptions: {
        rehypePlugins: [rehypeSlug, [rehypePrettyCode, { theme: 'github-dark-default', keepBackground: false }]],
      },
    },
  });
  return content;
}
