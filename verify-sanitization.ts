import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifySanitization() {
  console.log('Verifying recent news for robotic content...');
  
  const { data, error } = await supabase
    .from('news')
    .select('title, content')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching news:', error);
    return;
  }

  data.forEach((item, index) => {
    console.log(`\n--- Article ${index + 1}: ${item.title} ---`);
    const content = item.content.slice(0, 500);
    const hasRobotic = /Why This Matters|What To Watch Next|Verified Source Material|Intelligence Source/i.test(item.content);
    
    console.log(`Status: ${hasRobotic ? '❌ CONTAINS ROBOTIC TEXT' : '✅ CLEAN'}`);
    console.log(`Snippet: ${content}...`);
  });
}

verifySanitization();
