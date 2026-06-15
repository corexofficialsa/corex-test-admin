import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://ximnlscqotdjohdlcqat.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpbW5sc2Nxb3Rkam9oZGxjcWF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MjM1OTksImV4cCI6MjA5NzA5OTU5OX0.3LBm9sUVEN0gAfFPoDtvTEU48S6ipskF52w_eFVOoPQ'
);
