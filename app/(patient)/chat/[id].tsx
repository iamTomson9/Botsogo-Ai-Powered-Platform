import React from 'react';
import ChatInterface from '../../../components/Chat/ChatInterface';

export default function PatientChatRoute() {
  return <ChatInterface isDoctorView={false} />;
}
