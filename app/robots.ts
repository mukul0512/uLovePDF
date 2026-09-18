import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';
import { ROUTES } from '@/constants/routes';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ROUTES.designSystem,
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
