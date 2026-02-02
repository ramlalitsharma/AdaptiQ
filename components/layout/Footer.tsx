import Link from 'next/link';
import { SiteBrand } from './SiteBrand';
import { BRAND_NAME } from '@/lib/brand';

const footerLinks = [
  {
    title: 'Platform',
    items: [
      { label: 'Courses', href: '/courses' },
      { label: 'Subjects', href: '/subjects' },
      { label: 'Exams', href: '/exams' },
      { label: 'Preparations', href: '/preparations' },
    ],
  },
  {
    title: 'Company',
    items: [
      { label: 'Blog', href: '/blog' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Support',
    items: [
      { label: 'Pricing', href: '/pricing' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
  },
];

const socialLinks = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/adaptiq' },
  { label: 'Twitter', href: 'https://twitter.com/adaptiq' },
  { label: 'YouTube', href: 'https://www.youtube.com/@adaptiq' },
];

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-800 to-transparent" />

      <div className="container mx-auto px-4 py-16 grid gap-12 lg:grid-cols-[1.5fr,1fr] relative z-10">
        <div className="space-y-6">
          <SiteBrand variant="light" />
          <p className="max-w-md text-base text-slate-400 leading-relaxed">
            {BRAND_NAME} is the AI-native learning platform delivering adaptive learning paths, certification workflows, and real-time analytics for learners and administrators.
          </p>
          <div className="flex gap-4 pt-4">
            {socialLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-all hover:scale-110"
              >
                {/* We can use icons here if we had them imported, for now text is fine but let's assume icons or just labels */}
                <span className="text-[10px] uppercase font-bold">{link.label[0]}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-8 grid-cols-2 sm:grid-cols-3">
          {footerLinks.map((group) => (
            <div key={group.title} className="space-y-4">
              <h3 className="font-bold text-white tracking-wide text-sm uppercase">{group.title}</h3>
              <ul className="space-y-3">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2 group">
                      <span className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-teal-500 transition-colors" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8 text-xs font-medium text-slate-500 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Systems Normal
            </span>
            <p className="text-slate-600">AI-powered adaptive learning infrastructure.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
