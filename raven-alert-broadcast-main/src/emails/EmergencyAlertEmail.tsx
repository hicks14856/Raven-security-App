import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface EmergencyAlertEmailProps {
  userName: string;
  time: string;
  date: string;
  mapsLink: string;
  audioUrl?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export const EmergencyAlertEmail = ({
  userName,
  time,
  date,
  mapsLink,
  audioUrl,
  location,
}: EmergencyAlertEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Emergency Alert from {userName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>🚨 Emergency Alert</Heading>
          
          <Section style={section}>
            <Text style={text}>
              This is an emergency alert from {userName}. They have activated their emergency alert system.
            </Text>
            
            <Text style={text}>
              Time: {time} on {date}
            </Text>
            
            {location && (
              <Text style={text}>
                Location: {location.latitude}, {location.longitude}
              </Text>
            )}
            
            <Link href={mapsLink} style={button}>
              View Location on Google Maps
            </Link>
          </Section>

          {audioUrl && (
            <Section style={section}>
              <Text style={text}>
                An audio message has been recorded. Click the link below to listen:
              </Text>
              <Link href={audioUrl} style={button}>
                Listen to Emergency Message
              </Link>
            </Section>
          )}

          <Section style={section}>
            <Text style={footer}>
              This is an automated message from the Raven E-Alert system. Please respond immediately if you receive this alert.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '580px',
};

const section = {
  padding: '24px',
  border: 'solid 1px #dedede',
  borderRadius: '5px',
  textAlign: 'center' as const,
  backgroundColor: '#f9f9f9',
  margin: '24px 0',
};

const h1 = {
  color: '#ff0000',
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '40px 0',
};

const text = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#333333',
  margin: '16px 0',
};

const button = {
  backgroundColor: '#ff0000',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  padding: '12px',
  margin: '16px 0',
};

const footer = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '24px',
  textAlign: 'center' as const,
  margin: '24px 0',
}; 