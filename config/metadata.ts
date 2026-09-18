import type { Metadata } from 'next';
import { siteConfig, absoluteUrl } from '@/config/site';
import { ROUTES } from '@/constants/routes';
import { TOOL_LIST, type ToolDefinition, type ToolFaq } from '@/constants/tools';
import { logger } from '@/utils/commonFunctions/logger';

interface PageMetadataInput {
  readonly title: string;
  readonly description: string;
  readonly path?: string | null | undefined;
}

export function buildPageMetadata({ title, description, path }: PageMetadataInput): Metadata {
  const canonical = path ? absoluteUrl(path) : undefined;

  logger.debug('app', 'page metadata', { title, path: path ?? null, canonical: canonical ?? null });

  return {
    title,
    description,
    ...(canonical ? { alternates: { canonical } } : {}),
    openGraph: {
      type: 'website',
      locale: 'en_US',
      siteName: siteConfig.name,
      title,
      description,
      ...(canonical ? { url: canonical } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export function buildToolMetadata(tool: ToolDefinition): Metadata {
  return buildPageMetadata({
    title: tool.seoTitle,
    description: tool.description,
    path: tool.href,
  });
}

export function buildFaqJsonLd(faqs: readonly ToolFaq[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  } as const;
}

export function buildBreadcrumbJsonLd(tool: ToolDefinition) {
  const pageUrl = tool.href === null ? absoluteUrl(ROUTES.home) : absoluteUrl(tool.href);

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: absoluteUrl(ROUTES.home),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: tool.name,
        item: pageUrl,
      },
    ],
  } as const;
}

export const webApplicationJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['WebApplication', 'SoftwareApplication'],
      name: siteConfig.name,
      alternateName: ['Recto PDF Editor', 'Recto free online PDF editor'],
      url: siteConfig.url,
      description: siteConfig.description,
      applicationCategory: 'BusinessApplication',
      applicationSubCategory: 'PDF Editor',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript. Runs entirely in the browser.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      featureList: [
        'Free online PDF editor',
        'Annotate and sign PDF',
        ...TOOL_LIST.map((tool) => tool.name),
      ],
      keywords:
        'pdf editor, free online pdf editor, edit pdf online, merge pdf, split pdf, compress pdf',
    },
    {
      '@type': 'WebSite',
      name: siteConfig.name,
      alternateName: 'Recto PDF Editor',
      url: siteConfig.url,
      description: siteConfig.description,
      inLanguage: 'en',
    },
  ],
} as const;
