import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/config/site';
import { ROUTES } from '@/constants/routes';
import { TOOL_LIST } from '@/constants/tools';
import { logger } from '@/utils/commonFunctions/logger';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [
    { url: absoluteUrl(ROUTES.home) },
    { url: absoluteUrl(ROUTES.privacy) },
    ...TOOL_LIST.flatMap((tool) => (tool.href === null ? [] : [{ url: absoluteUrl(tool.href) }])),
  ];

  logger.debug('app', 'sitemap', { urls: entries.map((entry) => entry.url) });
  return entries;
}
