// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://lywdivwtwjmwiwpjzbuj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5d2Rpdnd0d2ptd2l3cGp6YnVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYxMjYxNTgsImV4cCI6MjA1MTcwMjE1OH0.a8ncGdsPgfz-qoHGBvT7Uxc3A-wZ2b1JTjzZZ-qK9-8";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);