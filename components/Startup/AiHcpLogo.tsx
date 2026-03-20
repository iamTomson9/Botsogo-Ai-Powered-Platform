import React from 'react';
import Svg, { Ellipse, Rect } from 'react-native-svg';

export function AiHcpLogo({ size = 72, color = '#5BAFB8' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Ellipse cx="50" cy="50" rx="42" ry="16" stroke={color} strokeWidth="3.5" fill="none" />
      <Ellipse cx="50" cy="50" rx="42" ry="16" stroke={color} strokeWidth="3.5" fill="none" transform="rotate(45 50 50)" />
      <Ellipse cx="50" cy="50" rx="42" ry="16" stroke={color} strokeWidth="3.5" fill="none" transform="rotate(90 50 50)" />
      <Ellipse cx="50" cy="50" rx="42" ry="16" stroke={color} strokeWidth="3.5" fill="none" transform="rotate(135 50 50)" />
      {/* White cross / plus in center using Rect */}
      <Rect x="44" y="30" width="12" height="40" rx="3" fill={color} />
      <Rect x="30" y="44" width="40" height="12" rx="3" fill={color} />
    </Svg>
  );
}
