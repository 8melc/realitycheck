import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  if (!supabaseServiceKey) {
    return NextResponse.json({ 
      success: false, 
      error: 'SUPABASE_SERVICE_ROLE_KEY not configured. Add it to .env.local' 
    }, { status: 500 })
  }
  
  // Client mit Service Role (bypassed RLS)
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  
  try {
    // Da auth.users eine System-Tabelle ist, müssen wir eine SQL-Funktion verwenden
    // oder direkt über die Management API gehen
    
    // Versuche, eine SQL-Funktion aufzurufen (muss zuerst in Supabase erstellt werden)
    const { data, error } = await supabase.rpc('fix_confirmation_tokens')
    
    if (error) {
      // Falls die Funktion nicht existiert, gib Anweisungen
      if (error.message.includes('function') || error.message.includes('does not exist')) {
        return NextResponse.json({ 
          success: false, 
          error: 'SQL function not found',
          instructions: `
1. Go to Supabase Dashboard → SQL Editor
2. Run this SQL:
   CREATE OR REPLACE FUNCTION fix_confirmation_tokens()
   RETURNS void AS $$
   BEGIN
     UPDATE auth.users 
     SET confirmation_token = '' 
     WHERE confirmation_token IS NULL;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
3. Then call this API route again.
          `
        }, { status: 500 })
      }
      throw error
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Confirmation tokens fixed successfully',
      data
    })
    
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      note: 'Make sure SUPABASE_SERVICE_ROLE_KEY is set in .env.local'
    }, { status: 500 })
  }
}
