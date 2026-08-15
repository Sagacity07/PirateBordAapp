import {createClient} from '@supabase/supabase-js';

// Publishable keys are intentionally safe to ship in browser applications. Database
// access is enforced by Supabase Auth and the row-level security policies in schema.sql.
export const SUPABASE_URL='https://ahubumpcxhwppovllxvf.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY='sb_publishable_YHrSpw4ytNAkPlb1cgc83g_XLlUIeX6';

export const supabase=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{
  auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true},
});

