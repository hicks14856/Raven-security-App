
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase credentials')
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    console.log('Checking for scheduled alerts that need to be processed...')
    
    // Get current time
    const now = new Date()
    
    // Find scheduled alerts that are past their scheduled time and still pending
    // Removing the profile join since it was causing errors
    const { data: alerts, error } = await supabase
      .from('scheduled_alerts')
      .select('*')
      .eq('status', 'pending')
      .lt('scheduled_for', now.toISOString())
    
    if (error) {
      throw new Error(`Error fetching alerts: ${error.message}`)
    }
    
    console.log(`Found ${alerts?.length || 0} alerts to process`)
    
    if (!alerts || alerts.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No alerts to process' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Process each alert
    const results = []
    
    for (const alert of alerts) {
      console.log(`Processing alert ${alert.id} for user ${alert.user_id}`)
      
      try {
        // Mark as triggered
        const { error: updateError } = await supabase
          .from('scheduled_alerts')
          .update({ status: 'triggered' })
          .eq('id', alert.id)
        
        if (updateError) {
          throw new Error(`Error updating alert status: ${updateError.message}`)
        }
        
        // Get user's profile for name
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', alert.user_id)
          .single()
        
        // Get user's contacts
        const { data: contacts, error: contactsError } = await supabase
          .from('contacts')
          .select('*')
          .eq('user_id', alert.user_id)
        
        if (contactsError) {
          throw new Error(`Error fetching contacts: ${contactsError.message}`)
        }
        
        if (!contacts || contacts.length === 0) {
          console.log(`No contacts found for user ${alert.user_id}`)
          results.push({
            alert_id: alert.id,
            status: 'no_contacts',
            message: 'No contacts found for this user'
          })
          continue
        }
        
        // Get Google Maps link from user's last known location
        const { data: locationData, error: locationError } = await supabase
          .from('emergency_alerts')
          .select('location_lat, location_lng, google_maps_link')
          .eq('user_id', alert.user_id)
          .order('created_at', { ascending: false })
          .limit(1)
        
        let mapsLink = 'Location unavailable'
        
        if (!locationError && locationData && locationData.length > 0) {
          if (locationData[0].google_maps_link) {
            mapsLink = locationData[0].google_maps_link
          } else if (locationData[0].location_lat && locationData[0].location_lng) {
            mapsLink = `https://www.google.com/maps?q=${locationData[0].location_lat},${locationData[0].location_lng}`
          }
        }
        
        // Format date and time
        const time = new Date().toLocaleTimeString()
        const date = new Date().toLocaleDateString()
        
        // Format user name
        const userName = profileData?.full_name || 'User'
        
        // Send the alert using the emergency alert function
        const response = await fetch(`${supabaseUrl}/functions/v1/send-emergency-alert`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            contacts,
            location: { latitude: 0, longitude: 0 }, // Placeholder
            time,
            date,
            mapsLink,
            userName,
            isScheduledAlert: true,
            alertDetails: {
              location: alert.location,
              companions: alert.companions,
              notes: alert.notes
            }
          })
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Error calling send-emergency-alert: ${errorText}`)
        }
        
        const alertResult = await response.json()
        
        // Create emergency alert record
        await supabase
          .from('emergency_alerts')
          .insert({
            user_id: alert.user_id,
            status: 'sent',
            user_name: userName,
            google_maps_link: mapsLink,
            scheduled_alert_id: alert.id
          })
        
        results.push({
          alert_id: alert.id,
          status: 'triggered',
          notification_results: alertResult
        })
        
      } catch (alertError) {
        console.error(`Error processing alert ${alert.id}:`, alertError)
        results.push({
          alert_id: alert.id,
          status: 'error',
          error: alertError.message
        })
      }
    }
    
    return new Response(
      JSON.stringify({ 
        processed: results.length,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Error in process-scheduled-alerts function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    )
  }
})
