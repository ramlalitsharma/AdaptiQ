import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const locales = [
    'en', 'es', 'hi', 'zh', 'ja', 'ko', 'fr', 'de', 'it', 'pt',
    'ru', 'ar', 'ur', 'ms', 'id', 'tr', 'vi', 'bn', 'he'
];
export const localePrefix = 'always';

export const routing = defineRouting({
    locales,
    defaultLocale: 'en',
    localePrefix
});

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
