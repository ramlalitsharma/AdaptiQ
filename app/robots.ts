import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://adaptiq.com';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/api/',
                '/dashboard/',
                '/admin/',
                '/settings/',
                '/studio/',
                '/*/admin/',
                '/*/dashboard/'
            ],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
