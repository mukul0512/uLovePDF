import { ImageResponse } from 'next/og';
import { siteConfig } from '@/config/site';

export const dynamic = 'force-static';
export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: '#172c46',
        color: '#eef4fb',
        padding: 72,
      }}
    >
      <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: -0.4 }}>{siteConfig.name}</div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            fontSize: 60,
            fontWeight: 600,
            letterSpacing: -1.2,
            lineHeight: 1.15,
            maxWidth: 920,
          }}
        >
          {siteConfig.tagline}
        </div>
        <div style={{ marginTop: 20, fontSize: 26, color: '#b0cbeb' }}>
          Merge, split, rotate and compress in the browser.
        </div>
      </div>
    </div>,
    { ...size },
  );
}
