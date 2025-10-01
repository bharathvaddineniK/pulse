import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../constants/Colors';

const PulseLogo = () => {
  return (
    <Svg width="100" height="100" viewBox="0 0 24 24">
      <Path
        d="M22 12h-4l-3 9L9 3l-3 9H2" // A path for a single heartbeat pulse
        stroke={Colors.textPrimary} // Rendered in our Primary Text color
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
};

export default PulseLogo;