import { MetadataRoute } from 'next';
import { BRAND_NAME, BRAND_SHORT_NAME, BRAND_OG_IMAGE } from '@/lib/brand';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BRAND_NAME} - Adaptive Learning Platform`,
    short_name: BRAND_SHORT_NAME,
    description: 'AI-powered adaptive learning platform with real-time quiz adaptation, live classes, and personalized learning paths',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#ffffff',
    theme_color: '#0f766e',
    categories: ['education', 'learning', 'productivity'],
    icons: [
      {
        src: BRAND_OG_IMAGE,
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    screenshots: [
      {
        src: '/screenshot-wide.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide',
      },
      {
        src: '/screenshot-narrow.png',
        sizes: '750x1334',
        type: 'image/png',
        form_factor: 'narrow',
      },
    ],
    shortcuts: [
      {
        name: 'My Learning',
        short_name: 'Learning',
        description: 'Continue your learning journey',
        url: '/my-learning',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Courses',
        short_name: 'Courses',
        description: 'Browse courses',
        url: '/courses',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Live Classes',
        short_name: 'Live',
        description: 'Join live classes',
        url: '/live',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
    ],
  };
}
