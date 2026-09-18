import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { TOOL_LIST, type ToolDefinition } from '@/constants/tools';

interface PageMetadataInput {
  readonly title: string;
  readonly description: string;
  readonly path?: string | null | undefined;
}

export function buildPageMetadata({ title, description, path }: PageMetadataInput): Metadata {
  const url = path ?? undefined;

  return {
    title,
    description,
    ...(url ? { alternates: { canonical: url } } : {}),
    openGraph: {
      type: 'website',
      locale: 'en_US',
      siteName: siteConfig.name,
      title,
      description,
      ...(url ? { url } : {}),
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
    title: tool.name,
    description: tool.description,
    path: tool.href,
  });
}

export const webApplicationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: siteConfig.name,
  url: siteConfig.url,
  description: siteConfig.description,
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: TOOL_LIST.map((tool) => tool.name),
} as const;
