import React from 'react';
import ChatInterface from '../../../components/Chat/ChatInterface';

export default function PharmacistChatRoute() {
  return <ChatInterface isDoctorView={false} />;
}
