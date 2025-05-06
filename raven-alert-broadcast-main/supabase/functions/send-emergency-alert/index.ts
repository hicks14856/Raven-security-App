
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { Resend } from "npm:resend@2.0.0"
import React from 'npm:react@18.2.0'
import { renderToString } from 'npm:react-dom@18.2.0/server'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Modern React Email Component for Emergency Alerts
function EmergencyAlertEmail({ userName, time, date, mapsLink, audioUrl, alertDetails, userPhone, userLocation }) {
  return React.createElement('div', { style: { fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', backgroundColor: '#f7f7f7', borderRadius: '10px', overflow: 'hidden' } },
    React.createElement('div', { style: { background: 'linear-gradient(135deg, #ff416c, #ff4b2b)', color: 'white', padding: '24px', textAlign: 'center', borderRadius: '10px 10px 0 0' } },
      React.createElement('h1', { style: { margin: '0', fontWeight: '700', fontSize: '24px' } }, `EMERGENCY ALERT`),
      React.createElement('p', { style: { margin: '10px 0 0', fontSize: '18px', opacity: '0.9' } }, `From ${userName}`)
    ),
    React.createElement('div', { style: { padding: '30px', borderRadius: '0 0 10px 10px', background: '#fff', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' } },
      React.createElement('p', { style: { fontWeight: 'bold', fontSize: '16px', color: '#d32f2f', marginTop: '0' } }, 'This person has triggered an emergency alert and may need immediate assistance.'),
      React.createElement('div', { style: { background: '#ffebee', borderRadius: '8px', padding: '20px', marginBottom: '24px', border: '1px solid #ffcdd2' } },
        React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse' } },
          React.createElement('tbody', null,
            React.createElement('tr', null,
              React.createElement('td', { style: { padding: '8px 0', fontWeight: 'bold', width: '30%' } }, 'User:'),
              React.createElement('td', { style: { padding: '8px 0' } }, userName)
            ),
            userPhone && React.createElement('tr', null,
              React.createElement('td', { style: { padding: '8px 0', fontWeight: 'bold' } }, 'Phone:'),
              React.createElement('td', { style: { padding: '8px 0' } }, userPhone)
            ),
            userLocation && React.createElement('tr', null,
              React.createElement('td', { style: { padding: '8px 0', fontWeight: 'bold' } }, 'Current Location:'),
              React.createElement('td', { style: { padding: '8px 0' } }, userLocation)
            ),
            React.createElement('tr', null,
              React.createElement('td', { style: { padding: '8px 0', fontWeight: 'bold' } }, 'Time:'),
              React.createElement('td', { style: { padding: '8px 0' } }, time)
            ),
            React.createElement('tr', null,
              React.createElement('td', { style: { padding: '8px 0', fontWeight: 'bold' } }, 'Date:'),
              React.createElement('td', { style: { padding: '8px 0' } }, date)
            )
          )
        )
      ),
      React.createElement('div', { style: { marginBottom: '24px' } },
        React.createElement('a', { 
          href: mapsLink, 
          style: { 
            display: 'block',
            background: '#1976d2', 
            color: 'white', 
            textDecoration: 'none', 
            padding: '12px 20px', 
            borderRadius: '6px', 
            fontWeight: '600',
            textAlign: 'center',
            fontSize: '16px'
          } 
        }, 'VIEW LOCATION ON MAP')
      ),
      audioUrl && React.createElement('div', { style: { marginBottom: '24px', background: '#e8f5e9', padding: '15px', borderRadius: '6px', border: '1px solid #c8e6c9' } },
        React.createElement('p', { style: { margin: '0 0 12px', fontWeight: '600', color: '#2e7d32' } }, 'Emergency Audio Recording'),
        React.createElement('a', { 
          href: audioUrl, 
          style: { 
            display: 'block',
            background: '#43a047',
            color: 'white', 
            textDecoration: 'none', 
            padding: '10px 16px', 
            borderRadius: '6px',
            fontWeight: '600',
            textAlign: 'center',
            fontSize: '14px'
          } 
        }, 'LISTEN TO EMERGENCY RECORDING')
      ),
      alertDetails && React.createElement('div', { style: { marginTop: '24px', background: '#e3f2fd', padding: '20px', borderRadius: '6px', border: '1px solid #bbdefb' } },
        React.createElement('h2', { style: { margin: '0 0 16px', color: '#1565c0', fontSize: '18px', fontWeight: '600' } }, 'SCHEDULED ALERT DETAILS:'),
        React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse' } },
          React.createElement('tbody', null,
            React.createElement('tr', null,
              React.createElement('td', { style: { padding: '8px 0', fontWeight: 'bold', width: '30%', color: '#1565c0' } }, 'Planned Location:'),
              React.createElement('td', { style: { padding: '8px 0' } }, alertDetails.location)
            ),
            React.createElement('tr', null,
              React.createElement('td', { style: { padding: '8px 0', fontWeight: 'bold', color: '#1565c0' } }, 'With:'),
              React.createElement('td', { style: { padding: '8px 0' } }, alertDetails.companions)
            ),
            alertDetails.notes && React.createElement('tr', null,
              React.createElement('td', { style: { padding: '8px 0', fontWeight: 'bold', color: '#1565c0' } }, 'Notes:'),
              React.createElement('td', { style: { padding: '8px 0' } }, alertDetails.notes)
            )
          )
        )
      ),
      React.createElement('div', { style: { marginTop: '30px', padding: '15px', background: '#fafafa', border: '1px solid #eeeeee', borderRadius: '6px', textAlign: 'center' } },
        React.createElement('p', { style: { margin: '0', color: '#d32f2f', fontWeight: 'bold' } }, 'This is an emergency alert. Please check the location and contact emergency services if necessary.')
      ),
      React.createElement('div', { style: { marginTop: '20px', borderTop: '1px solid #eeeeee', paddingTop: '20px', textAlign: 'center', color: '#757575', fontSize: '14px' } },
        React.createElement('p', { style: { margin: '0' } }, 'For emergency services: Call 911 (US) or your local emergency number'),
        React.createElement('p', { style: { margin: '10px 0 0' } }, 'Sent via Raven E-Alert Band System')
      )
    )
  );
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Received emergency alert request')
    const { contacts, location, time, date, mapsLink, userName, audioUrl, isScheduledAlert, alertDetails, userPhone } = await req.json()
    
    if (!contacts || !location || !time || !date || !mapsLink) {
      throw new Error('Missing required data')
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured')
      return new Response(
        JSON.stringify({ 
          error: 'Email service not configured',
          status: 'failed'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 500 
        }
      )
    }

    console.log('Service configuration:', { 
      resendAvailable: !!resendApiKey,
      contactsCount: contacts.length
    })

    // Attempt to get address from coordinates
    let userLocation = null
    try {
      const geocodingResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.latitude},${location.longitude}&key=${Deno.env.get('GOOGLE_MAPS_API_KEY') || ''}`
      )
      const geocodingData = await geocodingResponse.json()
      if (geocodingData.results && geocodingData.results.length > 0) {
        userLocation = geocodingData.results[0].formatted_address
      }
    } catch (error) {
      console.error('Error getting address from coordinates:', error)
      // Continue without location address, we still have coordinates
    }

    // Create Resend client for email
    const resend = new Resend(resendApiKey)
    
    // Render React Email template to HTML
    const emailHtml = renderToString(
      React.createElement(EmergencyAlertEmail, {
        userName,
        time,
        date,
        mapsLink,
        audioUrl,
        userPhone,
        userLocation,
        alertDetails: isScheduledAlert ? alertDetails : null
      })
    )
    
    const results = []
    const ownerEmail = contacts.find(c => c.email?.includes("@gmail.com"))?.email || null
    const isTestingMode = true // In a real production environment, this would be determined by environment variables

    // Process each contact for email notification
    for (const contact of contacts) {
      console.log(`Processing contact: ${contact.name}`)
      
      if (contact.email) {
        try {
          // Check if we're in testing mode and this is not the owner's email
          const isOwnerEmail = ownerEmail && contact.email === ownerEmail
          
          if (isTestingMode && !isOwnerEmail) {
            console.log(`TESTING MODE: Would send email to ${contact.name} at ${contact.email}, skipping in testing mode`)
            results.push({ 
              type: 'email',
              contact: contact.name, 
              success: false, 
              error: 'TESTING_MODE',
              message: 'Email not sent because Resend free tier only allows sending to verified emails. This is a testing limitation.'
            })
            continue
          }
          
          console.log(`Sending email to ${contact.name} at ${contact.email}`)
          // Using the direct Resend API approach
          const emailResult = await resend.emails.send({
            from: 'Raven Emergency Alerts <alerts@resend.dev>',
            to: contact.email,
            subject: `EMERGENCY ALERT FROM ${userName}`,
            html: emailHtml,
          })
          
          if (emailResult && emailResult.error) {
            throw emailResult.error;
          }
          
          console.log(`Email sent to ${contact.email}, ID: ${emailResult?.id || 'unknown'}`)
          results.push({ 
            type: 'email', 
            contact: contact.name, 
            success: true, 
            id: emailResult?.id || 'sent'
          })
        } catch (error) {
          console.error(`Failed to send email to ${contact.email}:`, error)
          
          // Checking if error is related to Resend testing mode
          const errorMessage = error.message || 'Unknown error'
          const isTestModeError = errorMessage.includes('verify a domain') || 
                                 errorMessage.includes('your own email address')
          
          results.push({ 
            type: 'email',
            contact: contact.name, 
            success: false, 
            error: isTestModeError ? 'TESTING_MODE' : 'SEND_FAILED',
            message: errorMessage
          })
        }
      } else {
        console.log(`Contact ${contact.name} has no email address`)
        results.push({
          type: 'email',
          contact: contact.name,
          success: false,
          error: 'NO_EMAIL',
          message: 'No email address provided for this contact'
        })
      }
    }
    
    // Count successful and failed messages
    const successCount = results.filter(r => r.success).length
    const failedCount = results.filter(r => !r.success).length
    const testingModeCount = results.filter(r => r.error === 'TESTING_MODE').length
    
    console.log('Alert sending results:', {
      total: results.length,
      successful: successCount,
      failed: failedCount,
      testingMode: testingModeCount,
      results
    })

    return new Response(
      JSON.stringify({ 
        status: 'processed',
        successful: successCount,
        failed: failedCount,
        testingMode: testingModeCount,
        results,
        resendAvailable: !!resend
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('Error in send-emergency-alert function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        status: 'failed'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    )
  }
})
