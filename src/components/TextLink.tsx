import React from 'react';
import {
  TouchableOpacity,
  Text,
  GestureResponderEvent,
  TextStyle,
  StyleProp, // Import StyleProp
} from 'react-native';

interface TextLinkProps {
  label: string;
  onPress: (event: GestureResponderEvent) => void;
  style?: StyleProp<TextStyle>; // Use StyleProp to allow for arrays of styles
}

const TextLink = ({ label, onPress, style }: TextLinkProps) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text style={style}>{label}</Text>
    </TouchableOpacity>
  );
};

export default TextLink;