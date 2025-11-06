import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AdaptIQ - Adaptive Learning Platform',
    short_name: 'AdaptIQ',
    description: 'AI-powered adaptive learning platform with real-time quiz adaptation',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2563eb',
    icons: [
      {
        src: '/adaptiq.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
