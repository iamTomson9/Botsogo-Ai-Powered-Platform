import React from 'react';
import ChatInterface from '../../../components/Chat/ChatInterface';

export default function DoctorChatRoute() {
  return <ChatInterface isDoctorView={true} />;
}
