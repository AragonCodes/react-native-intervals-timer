import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Text from './Text';

const Button = ({
  label, onPress, buttonStyle, textStyle
}) => (
  <TouchableOpacity style={[styles.button, buttonStyle]} onPress={onPress}>
    <Text style={[styles.buttonText, textStyle]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    padding: 10,
    backgroundColor: 'blue',
    borderRadius: 5,
    marginVertical: 10,
    alignSelf: 'center'
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
  },
});

export default Button;
