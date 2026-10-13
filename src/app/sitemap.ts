import type {MetadataRoute} from 'next';
import {publicPages, siteOrigin} from '@/lib/site';
export default function sitemap(): MetadataRoute.Sitemap {
 return siteOrigin ? Object.keys(publicPages).map(path => ({url: `${siteOrigin}${path}`, changeFrequency: 'monthly' as const, priority: path === '/' ? 1 : 0.5})) : [];
}
