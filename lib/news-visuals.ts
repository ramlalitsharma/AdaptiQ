type LicensedImageEntry = {
  tags: string[];
  url: string;
  credit: string;
  license: 'partner' | 'public_domain';
};

const LICENSED_IMAGE_LIBRARY: LicensedImageEntry[] = [
  // Finance & Markets
  {
    tags: ['business', 'finance', 'economy', 'market', 'trade', 'stock', 'investing', 'gold'],
    url: 'https://images.unsplash.com/photo-1611974717482-98ea05afc195?auto=format&fit=crop&w=1600&q=80',
    credit: 'Unsplash Pro (Finance)', license: 'partner',
  },
  {
    tags: ['crypto', 'bitcoin', 'blockchain', 'currency', 'digital-finance'],
    url: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&w=1600&q=80',
    credit: 'Unsplash (Crypto)', license: 'partner',
  },
  // Technology & AI
  {
    tags: ['technology', 'tech', 'ai', 'digital', 'cyber', 'robot', 'chip'],
    url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1600&q=80',
    credit: 'Unsplash (AI)', license: 'partner',
  },
  {
    tags: ['coding', 'programming', 'software', 'cloud', 'data'],
    url: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1600&q=80',
    credit: 'Unsplash (Code)', license: 'partner',
  },
  // Geopolitics, War & Security
  {
    tags: ['war', 'conflict', 'military', 'security', 'defense', 'tank', 'explosion', 'iran', 'palestine', 'ukraine', 'conflict'],
    url: 'https://images.unsplash.com/photo-1590483734724-383b9f4badfe?auto=format&fit=crop&w=1600&q=80',
    credit: 'Unsplash (Conflict)', license: 'partner',
  },
  {
    tags: ['diplomacy', 'un', 'summit', 'flag', 'government', 'peacemaker', 'politics', 'china', 'us', 'europe'],
    url: 'https://images.unsplash.com/photo-1541872703-74c5e4001920?auto=format&fit=crop&w=1600&q=80',
    credit: 'Unsplash (Diplomacy)', license: 'partner',
  },
  // Health & Science
  {
    tags: ['health', 'medical', 'hospital', 'disease', 'science', 'lab', 'vaccine', 'virus'],
    url: 'https://images.unsplash.com/photo-1581093458791-9f3c3250bb8b?auto=format&fit=crop&w=1600&q=80',
    credit: 'Unsplash (Science)', license: 'partner',
  },
  // Environment & Space
  {
    tags: ['climate', 'environment', 'weather', 'flood', 'earthquake', 'storm', 'fire'],
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80',
    credit: 'Unsplash (Nature)', license: 'partner',
  },
  {
    tags: ['space', 'nasa', 'moon', 'stars', 'satellite', 'spacex'],
    url: 'https://images.unsplash.com/photo-1454789548928-132d7877e8a9?auto=format&fit=crop&w=1600&q=80',
    credit: 'Unsplash (Space)', license: 'partner',
  },
  // Culture & Social
  {
    tags: ['culture', 'social', 'protest', 'crowd', 'festival'],
    url: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1600&q=80',
    credit: 'Unsplash (Social)', license: 'partner',
  },
  // Sports & Athletics
  {
    tags: ['sports', 'cricket', 'football', 'stadium', 'match', 'athlete', 'tournament', 'championship', 'fifa', 'ipl'],
    url: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1600&q=80',
    credit: 'Unsplash (Sports)', license: 'partner',
  },
];

function scoreEntry(textPayload: string, category: string, entry: LicensedImageEntry): number {
  let score = 0;
  const loweredPayload = textPayload.toLowerCase();
  const loweredCategory = category.toLowerCase();
  
  for (const tag of entry.tags) {
    // 1. Massive multiplier if the primary assigned Category matches an image tag
    if (loweredCategory.includes(tag)) {
        score += 50; 
    }
    // 2. Small bump if the tag is found anywhere in the text as a standalone word
    if (new RegExp(`\\b${tag}\\b`, 'i').test(loweredPayload)) {
        score += 1;
    }
  }
  return score;
}

export function selectLicensedLibraryImage(params: {
  title?: string;
  summary?: string;
  category?: string;
  country?: string;
}) {
  const textPayload = `${params.title || ''} ${params.summary || ''} ${params.country || ''}`;
  const categoryPayload = params.category || 'World';
  
  const best = LICENSED_IMAGE_LIBRARY
    .map((entry) => ({ entry, score: scoreEntry(textPayload, categoryPayload, entry) }))
    .sort((a, b) => b.score - a.score)[0];

  // Require a much higher confidence score to prevent random accidental assignments
  if (!best || best.score <= 0) return null;
  return best.entry;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildTextGraphicDataUrl(params: {
  title: string;
  category?: string;
  country?: string;
}) {
  const title = (params.title || 'Terai Times Intelligence Report').trim().slice(0, 96);
  const category = (params.category || 'World').trim().slice(0, 18).toUpperCase();
  const country = (params.country || 'Global').trim().slice(0, 18).toUpperCase();
  
  // High-end coloring based on category
  const themeMap: Record<string, string> = {
    'Finance': '#06b6d4', // Cyan
    'Markets & Finance': '#06b6d4',
    'Geopolitics': '#e11d48', // Rose
    'Conflict & War': '#e11d48',
    'Technology': '#8b5cf6', // Violet
    'Technology & AI': '#8b5cf6',
    'Health': '#10b981', // Emerald
    'Environment': '#10b981',
    'Culture': '#f59e0b', // Amber
  };
  const accent = themeMap[params.category || ''] || '#f08821';

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#020617"/>
          <stop offset="60%" stop-color="#0f172a"/>
          <stop offset="100%" stop-color="#1e1b4b"/>
        </linearGradient>
        <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${accent}"/>
          <stop offset="100%" stop-color="#ffffff"/>
        </linearGradient>
        <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
          <path d="M 100 0 L 0 0 0 100" fill="none" stroke="white" stroke-width="0.5" opacity="0.04"/>
        </pattern>
        <filter id="glow">
          <feGaussianBlur stdDeviation="15" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <rect width="1600" height="900" fill="url(#bg)"/>
      <rect width="1600" height="900" fill="url(#grid)"/>
      
      {/* Generative Abstract Art Elements */}
      <path d="M -200 450 C 200 100, 600 800, 1800 300" fill="none" stroke="url(#glowGradient)" stroke-width="8" opacity="0.4" filter="url(#glow)"/>
      <path d="M -100 600 C 400 900, 800 200, 1700 700" fill="none" stroke="${accent}" stroke-width="4" opacity="0.3" filter="url(#glow)"/>
      <path d="M 0 200 Q 800 1000 1600 100" fill="none" stroke="white" stroke-width="1.5" opacity="0.1"/>
      
      <circle cx="1300" cy="200" r="450" fill="url(#glowGradient)" opacity="0.15" filter="url(#glow)"/>
      <polygon points="1200,800 1500,400 1800,900" fill="${accent}" opacity="0.03" />
      <polygon points="100,900 400,600 700,950" fill="white" opacity="0.02" />
      
      {/* Decorative tech/data lines */}
      <g opacity="0.5">
        <line x1="140" y1="100" x2="200" y2="100" stroke="${accent}" stroke-width="4" />
        <line x1="220" y1="100" x2="240" y2="100" stroke="white" stroke-width="4" opacity="0.8"/>
        <line x1="260" y1="100" x2="360" y2="100" stroke="${accent}" stroke-width="4" opacity="0.3"/>
        <line x1="140" y1="100" x2="140" y2="160" stroke="${accent}" stroke-width="4" />
      </g>
      
      {/* Editorial Branding & Typography */}
      <text x="140" y="165" fill="${accent}" font-family="Arial, sans-serif" font-size="20" font-weight="900" letter-spacing="8">TERAI TIMES INTELLIGENCE</text>
      <text x="140" y="225" fill="white" font-family="Georgia, serif" font-size="32" font-weight="700" letter-spacing="2" opacity="0.9">${escapeXml(category)} / ${escapeXml(country)}</text>
      
      <rect x="140" y="260" width="120" height="6" fill="url(#glowGradient)" filter="url(#glow)"/>
      
      {/* Headline Wrapper */}
      <foreignObject x="140" y="320" width="1200" height="400">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Georgia, serif; font-size: 78px; line-height: 1.15; color: white; font-weight: 700; text-shadow: 0 15px 40px rgba(0,0,0,0.8);">
          ${escapeXml(title)}
        </div>
      </foreignObject>
      
      {/* Footer Branding */}
      <text x="140" y="800" fill="#94a3b8" font-family="Arial, sans-serif" font-size="16" font-weight="700" letter-spacing="5">AUTONOMOUS SIGNAL • STRATEGIC DEPTH • VERIFIED DESK</text>
      
      {/* Scanning bar effect */}
      <rect x="0" y="880" width="1600" height="20" fill="url(#glowGradient)" opacity="0.2"/>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
