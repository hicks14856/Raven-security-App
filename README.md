# Raven-security-App
The raven SOS application is a technology that aims to revolutionise emergency SOS alert systems by providing better and more convenient options for users. This is achieved by introduction of new trigger systems and intuitive safety features.

<div align="center">
  <img src="public/raven-logo.png" alt="Raven Logo" width="200"/>
  <h1>Raven Emergency Alert System</h1>
  <p><strong>Your Personal Safety Companion</strong></p>
  
  <p>
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#how-it-works">How It Works</a> •
    <a href="#deployment">Deployment</a> •
    <a href="#future-plans">Future Plans</a> •
    <a href="#contribute">Contribute</a> •
    <a href="#license">License</a>
  </p>
</div>

## 🚨 Overview

Raven is a modern, user-friendly emergency alert system designed to provide peace of mind and enhanced safety. With a simple press of the SOS button, Raven instantly records audio, captures your location, and alerts your emergency contacts, potentially making all the difference in critical situations.

<div align="center">
  <img src="public/raven-dashboard.png" alt="Raven Dashboard" width="80%"/>
</div>

## ✨ Features <a name="features"></a>

- **One-Touch Emergency Alerts** - Instantly trigger alerts with a single press
- **Audio Recording** - Automatically captures 10 seconds of audio during emergencies
- **Precise Location Sharing** - Shares your exact location with emergency contacts
- **Multiple Notification Channels** - Alerts contacts via both SMS and email
- **Emergency Contact Management** - Add up to 5 trusted contacts
- **Scheduled Alerts** - Set future alerts for when you expect to reach your destination
- **Alert History** - Review past alerts with playable recordings and location data
- **Real-Time Dashboard** - Monitor your safety status and alert activity
- **Profile Management** - Maintain your personal and contact information

## 🛠️ Tech Stack <a name="tech-stack"></a>

### Frontend
- **Framework**: React 18 with TypeScript
- **State Management**: React Query, React Context API
- **Styling**: Tailwind CSS with shadcn/ui components
- **Routing**: React Router
- **Form Handling**: React Hook Form with Zod validation
- **Maps Integration**: Google Maps API
- **Audio Recording**: Native Web Audio API

### Backend
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth with email/password and phone verification
- **Storage**: Supabase Storage for audio recordings
- **Serverless Functions**: Supabase Edge Functions (Deno runtime)
- **Notifications**: 
  - Email: Resend API
  - SMS: Twilio API
- **Hosting**: Vercel (frontend) and Supabase (backend)

## 🚀 Getting Started <a name="getting-started"></a>

### Prerequisites

- Node.js 16.0.0 or higher
- npm, yarn, or pnpm
- Supabase account
- Resend account (for email notifications)
- Twilio account (for SMS notifications)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/raven-alert.git
   cd raven-alert
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file with the following variables:
   ```
   # Supabase
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Google Maps
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

4. Set up Supabase:
   - Create a new Supabase project
   - Run the SQL migrations found in the `supabase/migrations` directory
   - Configure Supabase Edge Functions for alerts and notifications
   - Add the required secrets to your Supabase project:
     - `TWILIO_ACCOUNT_SID`
     - `TWILIO_AUTH_TOKEN`
     - `TWILIO_PHONE_NUMBER`
     - `RESEND_API_KEY`

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📱 How It Works <a name="how-it-works"></a>

1. **Sign Up**: Create an account and verify your phone number
2. **Add Contacts**: Add your emergency contacts (up to 5)
3. **Emergency**: When in danger, press the SOS button
4. **Alert**: Raven records audio, captures your location, and sends alerts
5. **Response**: Your emergency contacts receive notifications with your location and audio

### Key Components

- **Emergency Button**: The central SOS button triggers the alert process
- **Audio Recording**: Automatically captures 10 seconds of audio during emergencies
- **Location Tracking**: Captures precise location data to include in alerts
- **Contact Management**: Add and manage your emergency contacts
- **Notifications**: Sends SMS and email alerts with location links and audio recordings
- **Dashboard**: Monitor your safety status and alert history

## 🌐 Deployment <a name="deployment"></a>

### Frontend Deployment (Vercel)

1. Create a Vercel account if you don't have one
2. Import your GitHub repository
3. Configure the environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GOOGLE_MAPS_API_KEY`
4. Deploy

### Backend Deployment (Supabase)

1. Create a production Supabase project
2. Run the SQL migrations from the `supabase/migrations` directory
3. Deploy the Edge Functions:
   ```bash
   npx supabase functions deploy --project-ref your-project-ref
   ```
4. Configure the required secrets in the Supabase dashboard

## 🔮 Future Plans <a name="future-plans"></a>

We're constantly working to make Raven even better. Here are some exciting features we're planning to implement:

### Wearable Device Integration
- **Smartwatch Compatibility**: Quick access to the SOS feature from Apple Watch, Samsung Galaxy Watch, and other wearables
- **Fitness Tracker Integration**: Connect with devices like Fitbit and Garmin for health data during emergencies
- **Custom Hardware**: Development of dedicated Raven wearable devices with built-in cellular connectivity

### AI Enhancements
- **Threat Detection**: Machine learning algorithms to automatically detect dangerous situations based on audio and movement patterns
- **Voice Recognition**: Trigger alerts with voice commands or safe words
- **Predictive Analysis**: Identify patterns in user behavior to predict and prevent dangerous situations
- **Natural Language Processing**: Analyze audio recordings for contextual information about emergencies

### Additional Features
- **Enhanced Analytics**: More detailed insights about safety patterns and emergency response
- **Community Safety Network**: Opt-in location sharing with nearby Raven users during emergencies
- **Emergency Services Integration**: Direct connections to local police, fire, and medical services
- **International Support**: Expanded language options and region-specific emergency protocols

## 🤝 Contribute <a name="contribute"></a>

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a pull request

Please make sure to update tests as appropriate.

## 📄 License <a name="license"></a>

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Contact

Project Link: [https://github.com/yourusername/raven-alert](https://github.com/yourusername/raven-alert)

---

<div align="center">
  <p>Built with ❤️ for a safer world</p>
  <p>© 2025 Raven Emergency Alert System</p>
</div>
