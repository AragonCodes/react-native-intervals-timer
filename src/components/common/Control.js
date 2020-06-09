import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Text from './Text';

const Control = ({
  field,
  updateField,
  renderField,
  label
}) => {
  const increaseState = () => updateField((state) => state + 1);
  const decreaseState = () => updateField((state) => ((state - 1 <= 0) ? 0 : state - 1));

  return (
    <View>
      <Text style={styles.indicatorLabel}>{label}</Text>
      <View style={styles.indicatorContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, { paddingBottom: 3 }]}
          onPress={decreaseState}
        >
          <Text style={styles.toggleButtonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.indicator}>
          {
            renderField
              ? renderField(field)
              : field
          }
        </Text>
        <TouchableOpacity style={styles.toggleButton} onPress={increaseState}>
          <Text style={styles.toggleButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  toggleButton: {
    backgroundColor: 'blue',
    width: 30,
    height: 30,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold'
  },
  indicator: {
    fontSize: 30,
    fontWeight: 'bold'
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 150,
    marginBottom: 20
  }
});

export default Control;
