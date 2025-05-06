
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
    const { audio, location, userId } = await req.json()

    if (!audio || !location || !userId) {
      throw new Error('Missing required data')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Upload audio recording
    const audioData = Uint8Array.from(atob(audio.split(',')[1]), c => c.charCodeAt(0))
    const fileName = `${crypto.randomUUID()}.webm`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('emergency-recordings')
      .upload(`${userId}/${fileName}`, audioData, {
        contentType: 'audio/webm',
        upsert: false
      })

    if (uploadError) {
      throw new Error(`Failed to upload audio: ${uploadError.message}`)
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from('emergency-recordings')
      .getPublicUrl(`${userId}/${fileName}`)

    // Create emergency alert record
    const { data: alertData, error: alertError } = await supabase
      .from('emergency_alerts')
      .insert({
        user_id: userId,
        location_lat: location.latitude,
        location_lng: location.longitude,
        audio_recording_url: publicUrlData.publicUrl,
        status: 'sent'
      })
      .select()
      .single()

    if (alertError) {
      throw new Error(`Failed to create alert: ${alertError.message}`)
    }

    // Also save to emergency_recordings table for the recordings page
    const { error: recordingError } = await supabase
      .from('emergency_recordings')
      .insert({
        user_id: userId,
        audio_url: publicUrlData.publicUrl,
        status: 'sent'
      })

    if (recordingError) {
      console.error(`Failed to create recording record: ${recordingError.message}`)
    }

    // Get user's emergency contacts
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', userId)

    if (contactsError) {
      throw new Error(`Failed to fetch contacts: ${contactsError.message}`)
    }

    // Send notifications to contacts
    const results = []
    let successful = 0
    let failed = 0

    for (const contact of contacts) {
      try {
        if (contact.email) {
          // Send email notification
          const { error: emailError } = await supabase.rpc('send_email', {
            recipient_email: contact.email,
            subject: 'EMERGENCY ALERT',
            body: `
              <h1>EMERGENCY ALERT</h1>
              <p>An emergency alert has been triggered.</p>
              <p>Location: <a href="${location.mapsLink || `https://www.google.com/maps?q=${location.latitude},${location.longitude}`}" target="_blank">View on Map</a></p>
              ${publicUrlData.publicUrl ? `<p>Audio recording: <a href="${publicUrlData.publicUrl}" target="_blank">Listen to recording</a></p>` : ''}
              <p>Please respond immediately.</p>
            `
          })

          if (emailError) {
            throw emailError
          }
          
          successful++
          results.push({ contact: contact.id, method: 'email', success: true })
        } else {
          failed++
          results.push({ contact: contact.id, method: 'email', success: false, error: 'No email address provided' })
        }
      } catch (error) {
        failed++
        results.push({ contact: contact.id, method: 'email', success: false, error: error.message })
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        successful, 
        failed, 
        results,
        audioUrl: publicUrlData.publicUrl 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Emergency alert error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
