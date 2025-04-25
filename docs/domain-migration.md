# Domain Migration Guide

This guide outlines the steps to migrate from worddirectory.app to our target domain while preserving SEO juice and ensuring proper sitemap handling.

## Pre-Migration Checklist

1. Ensure all sitemaps are properly indexed in Google Search Console
2. Take note of important metrics:
   - Current indexing status
   - Current search rankings
   - Current sitemap coverage

## Migration Steps

### 1. Search Console Setup
- Add the new domain as a property in Google Search Console
- Verify ownership
- Keep BOTH domains verified during migration

### 2. Environment Variables
```bash
# Current production (.env.production)
NEXT_PUBLIC_SITE_URL=worddirectory.app

# After migration (.env.production)
NEXT_PUBLIC_SITE_URL=<new-domain>  # Will be set in Vercel
```

### 3. Vercel Configuration
1. Add the new domain in Vercel project settings
2. Update the production environment variable:
   - Go to Project Settings > Environment Variables
   - Update NEXT_PUBLIC_SITE_URL to the new domain
   - Ensure it's only set for production environment

### 4. DNS Configuration
1. Add DNS records as specified by Vercel
2. Wait for DNS propagation (can take up to 48 hours)
3. Verify HTTPS is working on the new domain

### 5. Redirect Setup
- Set up 301 redirects from old to new domain
- Use Vercel's redirect configuration in `next.config.js` (this might be wrong lol):
```js
module.exports = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'worddirectory.app',
          },
        ],
        destination: 'https://<new-domain>/:path*',
        permanent: true,
      },
    ];
  },
};
```

### 6. Search Console Domain Change
1. Use the "Change of Address" tool in Search Console
2. This tells Google about the domain change
3. Monitor migration in Search Console for ~180 days

### 7. Post-Migration Monitoring
Monitor for 6 months:
- Search Console coverage
- Indexing status
- Search rankings
- 404 errors
- Sitemap status

## Rollback Plan

If issues occur:
1. Revert DNS changes
2. Remove redirects
3. Switch NEXT_PUBLIC_SITE_URL back
4. Deploy changes

## Timeline Expectations
- DNS Propagation: Up to 48 hours
- Google's full processing: 2-3 months
- Complete migration stability: ~6 months

Keep both domains and Search Console properties active for at least 6 months after migration (actually forever).

## Important Notes
- Our sitemaps will automatically update because they use NEXT_PUBLIC_SITE_URL
- No code changes needed in sitemap.ts files
- The change is controlled entirely through environment variables