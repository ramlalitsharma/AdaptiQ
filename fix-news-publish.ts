import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixAndRefresh() {
  console.log('🔧 Phase 1: Publishing all stuck PENDING_APPROVAL articles...');
  
  const now = new Date().toISOString();

  // 1. Publish all pending_approval articles
  const { data: pending, error: fetchErr } = await supabase
    .from('news')
    .select('id, title, status')
    .eq('status', 'pending_approval');

  if (fetchErr) { console.error('Fetch error:', fetchErr.message); process.exit(1); }

  console.log(`  Found ${pending?.length || 0} stuck articles.`);

  if (pending && pending.length > 0) {
    const { error: updateErr, count } = await supabase
      .from('news')
      .update({ 
        status: 'published', 
        published_at: now,
        updated_at: now 
      })
      .eq('status', 'pending_approval');

    if (updateErr) {
      console.error('  ❌ Update failed:', updateErr.message);
    } else {
      console.log(`  ✅ Published ${count || pending.length} articles.`);
    }
  }

  // 2. Also stamp published_at for published articles that are missing it
  const { error: stampErr, count: stampCount } = await supabase
    .from('news')
    .update({ published_at: now, updated_at: now })
    .eq('status', 'published')
    .is('published_at', null);

  if (!stampErr) {
    console.log(`  ✅ Stamped published_at on ${stampCount || 0} articles that were missing it.`);
  }

  // 3. Final count
  const { count: finalPublished } = await supabase
    .from('news')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published');

  console.log(`\n✅ Done. Total published news now: ${finalPublished}`);
  console.log('🎉 Refresh your news page — articles should now appear!');
}

fixAndRefresh().catch(console.error);
