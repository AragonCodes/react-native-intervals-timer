import React from 'react';
import { Text as TextNative } from 'react-native';

const Text = ({
  style, center, start, children
}) => {
  const alignSelf = (center)
    ? 'center'
    : (start)
      ? 'start'
      : 'auto';

  return (
    <TextNative style={[style, { alignSelf }]}>
      {children}
    </TextNative>
  );
};

export default Text;
