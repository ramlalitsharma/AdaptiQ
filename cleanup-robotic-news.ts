import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupPoisonedNews() {
  console.log('Starting cleanup of poisoned news items...');
  
  const roboticPatterns = [
    '%Why This Matters%',
    '%What To Watch Next%',
    '%Verified Source Material%',
    '%Intelligence Source%',
    '%TARGETED NEWS BRIEFING%'
  ];

  let totalDeleted = 0;

  for (const pattern of roboticPatterns) {
    const { data, error, count } = await supabase
      .from('news')
      .delete({ count: 'exact' })
      .ilike('content', pattern);
    
    if (error) {
      console.error(`Error deleting items with pattern "${pattern}":`, error);
    } else {
      console.log(`Deleted ${count || 0} items matching pattern "${pattern}"`);
      totalDeleted += (count || 0);
    }
  }

  console.log(`Cleanup complete. Total items removed: ${totalDeleted}`);
}

cleanupPoisonedNews();
