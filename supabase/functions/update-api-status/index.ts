// This edge function updates API connection status for users
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get the user from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid user token" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }
    
    // Get the request body
    const { userId, service, connected, lastChecked } = await req.json();
    
    if (!userId || !service || typeof connected !== 'boolean') {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Verify the user can only update their own status
    if (userId !== user.id) {
      return new Response(
        JSON.stringify({ error: "Unauthorized to update this user's API status" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }
    
    // Get current profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('api_connections')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch user profile" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    // Update the API connections object
    const currentConnections = profile.api_connections || {};
    const updatedConnections = {
      ...currentConnections,
      [service]: {
        connected,
        last_checked: lastChecked || new Date().toISOString()
      }
    };
    
    // Update the profile with new API connection status
    const updateData: any = {
      api_connections: updatedConnections
    };
    
    // Also update the specific service column if it exists
    if (service === 'elevenlabs') {
      updateData.elevenlabs_api_connected = connected;
    }
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId);
    
    if (updateError) {
      console.error('Error updating API status:', updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update API status" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    console.log(`✅ Updated ${service} API status for user ${userId}: ${connected ? 'connected' : 'disconnected'}`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        service, 
        connected,
        lastChecked: lastChecked || new Date().toISOString()
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
    
  } catch (error) {
    console.error('Error in update-api-status function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});