// Type declarations for Deno modules
declare module "https://deno.land/std@0.168.0/http/server.ts" {
    export function serve(handler: (req: Request) => Response | Promise<Response>): void;
  }
  
  declare module "https://deno.land/x/xhr@0.1.0/mod.ts" {}
  
  declare module "https://esm.sh/@supabase/supabase-js@2.43.0" {
    export function createClient(url: string, key: string): any;
  }
  
  // Declare Deno namespace
  declare namespace Deno {
    export interface Env {
      get(key: string): string | undefined;
    }
    export const env: Env;
  }
  