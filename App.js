import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity
} from 'react-native';

const withLeadingZero = (seconds) => (seconds >= 10 ? seconds : `0${seconds}`);
const printMinutesSeconds = (seconds) => `${Math.floor(seconds / 60)}:${withLeadingZero(seconds % 60)}`;
const printTimer = (seconds) => ((seconds >= 60) ? printMinutesSeconds(seconds) : `${seconds}`);
const maxTimerDuration = 59 * 60 + 59; // MAX TIMER => 59:59
const STATUS_COUNTDOWN_WORK = 'WORK';
const STATUS_COUNTDOWN_REST = 'REST';
const STATUS_COUNTDOWN_FINISHED = 'FINISHED';

const HorizontalBreak = () => (
  <View style={styles.horizontalBreak} />
);

export default function App() {
  const [workDuration, setWorkDuration] = useState(5);
  const increaseWorkDuration = () => setWorkDuration((state) => state + 1);
  const decreaseWorkDuration = () => {
    setWorkDuration((state) => ((state - 1) > 0 ? state - 1 : 0));
  };

  const [restDuration, setRestDuration] = useState(5);
  const increaseRestDuration = () => {
    setRestDuration((state) => ((state + 1) < maxTimerDuration ? state + 1 : maxTimerDuration));
  };
  const decreaseRestDuration = () => {
    setRestDuration((state) => ((state - 1) > 0 ? state - 1 : 0));
  };

  const [setsCount, setSetsCount] = useState(1);
  const increaseSetsCount = () => {
    setSetsCount((state) => ((state + 1) < maxTimerDuration ? state + 1 : maxTimerDuration));
  };
  const decreaseSetsCount = () => {
    setSetsCount((state) => ((state - 1) > 0 ? state - 1 : 0));
  };

  const [currentSetsLeft, setCurrentSetsLeft] = useState(0);
  const [currentWorkDuration, setCurrentWorkDuration] = useState(0);
  const [currentRestDuration, setCurrentRestDuration] = useState(0);
  const [countdownStatus, setCountdownStatus] = useState('');

  const [timer, setTimer] = useState(workDuration);
  const decreaseCountdown = () => setTimer((state) => ((state - 1) > 0 ? state - 1 : 0));

  useEffect(() => {
    let timeout;
    if (countdownStatus && countdownStatus !== STATUS_COUNTDOWN_FINISHED) {
      timeout = setTimeout(() => {
        decreaseCountdown();
        if (timer - 1 === 0) {
          if (countdownStatus === STATUS_COUNTDOWN_WORK) {
            if (currentSetsLeft > 1) {
              setTimer(currentRestDuration);
              setCountdownStatus(STATUS_COUNTDOWN_REST);
            } else {
              setCountdownStatus(STATUS_COUNTDOWN_FINISHED);
            }
          } else if (countdownStatus === STATUS_COUNTDOWN_REST) {
            setTimer(currentWorkDuration);
            setCountdownStatus(STATUS_COUNTDOWN_WORK);
            setCurrentSetsLeft((status) => status - 1);
          }
        }
      }, 1000);
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [timer]);

  const startCountdown = () => {
    setCurrentSetsLeft(setsCount);
    setCurrentWorkDuration(workDuration);
    setCurrentRestDuration(restDuration);
    setTimer(currentWorkDuration);
    setCountdownStatus(STATUS_COUNTDOWN_WORK);
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.indicatorLabel}>
          SETS
        </Text>
        <View style={styles.indicatorContainer}>
          <TouchableOpacity style={[styles.toggleButton, { paddingBottom: 3 }]} onPress={decreaseSetsCount}>
            <Text style={styles.toggleButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.indicator}>{setsCount}</Text>
          <TouchableOpacity style={styles.toggleButton} onPress={increaseSetsCount}>
            <Text style={styles.toggleButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View>
        <Text style={styles.indicatorLabel}>
          WORK
        </Text>
        <View style={styles.indicatorContainer}>
          <TouchableOpacity style={[styles.toggleButton, { paddingBottom: 3 }]} onPress={decreaseWorkDuration}>
            <Text style={styles.toggleButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.indicator}>{printMinutesSeconds(workDuration)}</Text>
          <TouchableOpacity style={styles.toggleButton} onPress={increaseWorkDuration}>
            <Text style={styles.toggleButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View>
        <Text style={styles.indicatorLabel}>
          REST
        </Text>
        <View style={styles.indicatorContainer}>
          <TouchableOpacity style={[styles.toggleButton, { paddingBottom: 3 }]} onPress={decreaseRestDuration}>
            <Text style={styles.toggleButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.indicator}>{printMinutesSeconds(restDuration)}</Text>
          <TouchableOpacity style={styles.toggleButton} onPress={increaseRestDuration}>
            <Text style={styles.toggleButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity style={styles.button} onPress={startCountdown}>
        <Text style={styles.buttonText}>Start Timer</Text>
      </TouchableOpacity>
      <HorizontalBreak />
      <Text>
        {`Set #${currentSetsLeft}`}
      </Text>
      <Text style={[styles.indicatorLabel, {}]}>
        {countdownStatus}
      </Text>
      <Text style={{ marginHorizontal: 15, fontSize: 30, fontWeight: 'bold' }}>{printTimer(timer)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  button: {
    padding: 10,
    backgroundColor: 'blue',
    borderRadius: 5,
    marginVertical: 10
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
  },
  horizontalBreak: {
    borderBottomColor: '#888',
    width: '95%',
    borderWidth: 0.5,
    marginVertical: 5
  },
  indicator: {
    fontSize: 30,
    fontWeight: 'bold'
  },
  indicatorLabel: {
    alignSelf: 'center'
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 150,
    marginBottom: 20
  }
});
