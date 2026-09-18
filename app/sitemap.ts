import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/config/site';
import { ROUTES } from '@/constants/routes';
import { TOOL_LIST } from '@/constants/tools';
import { logger } from '@/utils/commonFunctions/logger';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const entries: MetadataRoute.Sitemap = [
    { url: absoluteUrl(ROUTES.home), lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: absoluteUrl(ROUTES.privacy), lastModified, changeFrequency: 'yearly', priority: 0.3 },
    ...TOOL_LIST.flatMap((tool) =>
      tool.href === null
        ? []
        : [
            {
              url: absoluteUrl(tool.href),
              lastModified,
              changeFrequency: 'weekly' as const,
              priority: tool.id === 'editor' ? 0.9 : 0.8,
            },
          ],
    ),
  ];

  logger.debug('app', 'sitemap', { urls: entries.map((entry) => entry.url) });
  return entries;
}
