import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnose() {
  console.log('🔍 Running News Site Diagnostics...\n');

  // 1. Count total news
  const { count: totalCount, error: countErr } = await supabase
    .from('news')
    .select('*', { count: 'exact', head: true });
  console.log(`📰 Total news in DB: ${totalCount ?? 'ERROR'} ${countErr ? '❌ ' + countErr.message : ''}`);

  // 2. Count published news
  const { count: publishedCount, error: pubErr } = await supabase
    .from('news')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published');
  console.log(`✅ Published news: ${publishedCount ?? 'ERROR'} ${pubErr ? '❌ ' + pubErr.message : ''}`);

  // 3. Count draft news
  const { count: draftCount } = await supabase
    .from('news')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'draft');
  console.log(`📝 Draft news: ${draftCount ?? 'ERROR'}`);

  // 4. Check expired news
  const { count: expiredCount } = await supabase
    .from('news')
    .select('*', { count: 'exact', head: true })
    .lt('expires_at', new Date().toISOString());
  console.log(`⏰ Expired news: ${expiredCount ?? 'ERROR'}`);

  // 5. Most recent 3 articles
  const { data: recent, error: recentErr } = await supabase
    .from('news')
    .select('title, status, created_at, expires_at')
    .order('created_at', { ascending: false })
    .limit(3);

  if (recentErr) {
    console.log('\n❌ Error fetching recent news:', recentErr.message);
  } else if (!recent || recent.length === 0) {
    console.log('\n⚠️  NO NEWS RECORDS FOUND IN DATABASE AT ALL!');
  } else {
    console.log('\n📋 Most recent articles:');
    recent.forEach((item, i) => {
      const expired = item.expires_at && new Date(item.expires_at) < new Date();
      console.log(`  ${i+1}. [${item.status?.toUpperCase()}] ${item.title?.slice(0, 60)}`);
      console.log(`     Created: ${item.created_at} | Expires: ${item.expires_at} ${expired ? '⚠️ EXPIRED' : '✅'}`);
    });
  }

  // 6. Check table structure
  const { data: sample } = await supabase.from('news').select('*').limit(1).maybeSingle();
  if (sample) {
    console.log('\n🗂️  Table columns found:', Object.keys(sample).join(', '));
  }

  console.log('\n✅ Diagnostics complete.');
}

diagnose().catch(console.error);
