// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://aebrfozpqhrfualvrsog.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlYnJmb3pwcWhyZnVhbHZyc29nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4Mjc0NjQsImV4cCI6MjA1NDQwMzQ2NH0.QTxjFvBSJeVcAP3nlGcNEAZd5d5Vwp48xbEZhP44aXg";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);