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
    <footer className="bg-[#050810] text-slate-300 relative overflow-hidden border-t border-white/5">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(6,182,212,0.05),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(168,85,247,0.05),transparent_70%)] pointer-events-none" />

      <div className="container mx-auto px-4 py-20 grid gap-16 lg:grid-cols-[1.5fr,1fr] relative z-10">
        <div className="space-y-8">
          <SiteBrand />
          <p className="max-w-md text-sm text-slate-500 font-medium leading-loose uppercase tracking-wider">
            {BRAND_NAME} IS THE AI-NATIVE LEARNING INFRASTRUCTURE DELIVERING ADAPTIVE NEURAL PATHWAYS AND REAL-TIME EVALUATION TELEMETRY.
          </p>
          <div className="flex gap-4 pt-4">
            {socialLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 hover:border-elite-accent-cyan/50 flex items-center justify-center text-white transition-all group"
              >
                <span className="text-xs font-black uppercase tracking-tighter group-hover:scale-110 transition-transform">{link.label.slice(0, 2)}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-12 grid-cols-2 sm:grid-cols-3">
          {footerLinks.map((group) => (
            <div key={group.title} className="space-y-6">
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">{group.title}</h3>
              <ul className="space-y-4">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all flex items-center gap-3 group">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/5 group-hover:bg-elite-accent-cyan transition-colors" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="text-[8px] font-black text-slate-600 uppercase tracking-[0.4em]">
            © {new Date().getFullYear()} {BRAND_NAME} // CORE SYSTEMS V2.8.0
          </div>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-40"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[8px] font-black text-emerald-500/80 uppercase tracking-widest">Global Link Stable</span>
            </div>
            <div className="text-[8px] font-black text-slate-600 uppercase tracking-[0.4em]">
              NEURAL PROTOCOL ACTIVE
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
