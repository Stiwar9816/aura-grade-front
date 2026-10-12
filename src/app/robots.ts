import type {MetadataRoute} from 'next';
import {siteOrigin} from '@/lib/site';
export default function robots(): MetadataRoute.Robots {
 // Private pages remain crawlable so engines can read their noindex directive.
 return {
  rules: {userAgent: '*', ...(siteOrigin ? {allow: '/', disallow: '/api/'} : {disallow: '/'})},
  ...(siteOrigin ? {sitemap: `${siteOrigin}/sitemap.xml`} : {}),
 };
}
