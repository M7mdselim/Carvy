
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'
import { supabase as integrationSupabase } from '../integrations/supabase/client'

// Use the integration supabase client to ensure consistency
export const supabase = integrationSupabase
