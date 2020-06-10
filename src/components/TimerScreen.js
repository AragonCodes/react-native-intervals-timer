import React, { useState, useEffect, useCallback } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { View } from 'react-native';
import { Audio } from 'expo-av';

import { Text, Button } from './common';
import styles from '../style';
import { printTimer } from '../modules/format';
import audioShortBeep from '../../assets/short-beep.mp3';
import audioLongBeep from '../../assets/long-beep.mp3';
import audioFinishedBeep from '../../assets/finished-beep.mp3';

const DEFAULT_START_DURATION = 5;
const TIMER_STATUS = {
  START: 'START',
  WORK: 'WORK',
  REST: 'REST',
  FINISHED: 'FINISHED'
};

const soundShortBeep = new Audio.Sound();
const soundLongBeep = new Audio.Sound();
const soundFinishedBeep = new Audio.Sound();
(async () => {
  await soundShortBeep.loadAsync(audioShortBeep);
  await soundLongBeep.loadAsync(audioLongBeep);
  await soundFinishedBeep.loadAsync(audioFinishedBeep);
})();

const playSound = async (sound) => {
  try {
    await sound.replayAsync();
  } catch (error) {
    console.error(error);
  }
};

const TimerScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    sets: numSets,
    work: workDuration,
    rest: restDuration
  } = route.params;

  const [status, setStatus] = useState(TIMER_STATUS.START);
  const [isCounting, setIsCounting] = useState(false);
  const [currentSetsLeft, setCurrentSetsLeft] = useState(0);
  const [timer, setTimer] = useState(0);
  const timerTick = () => setTimer((state) => ((state - 1) > 0 ? state - 1 : 0));

  useEffect(() => {
    let timeout;

    if (!isCounting && timeout) {
      clearTimeout(timeout);
    }

    if (isCounting) {
      timeout = setTimeout(() => {
        timerTick();

        // Interval transition
        if (timer - 1 === 0) {
          if (status === TIMER_STATUS.WORK) {
            if (currentSetsLeft > 1) {
              setTimer(restDuration);
              setStatus(TIMER_STATUS.REST);
            } else {
              setStatus(TIMER_STATUS.FINISHED);
              stopTimer();
            }
          } else if (
            status === TIMER_STATUS.START
            || status === TIMER_STATUS.REST
          ) {
            setTimer(workDuration);
            setStatus(TIMER_STATUS.WORK);
            if (status === TIMER_STATUS.REST) {
              setCurrentSetsLeft((state) => state - 1);
            }
          }
        }

        // Countdown sounds
        if ((timer - 1) > 0 && (timer - 1) <= 3) {
          playSound(soundShortBeep);
        } else if ((timer - 1) === 0) {
          if (status === TIMER_STATUS.WORK && currentSetsLeft === 1) {
            playSound(soundFinishedBeep);
          } else {
            playSound(soundLongBeep);
          }
        }
      }, 1000);
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [
    timer,
    isCounting,
    status,
    currentSetsLeft,
    restDuration,
    workDuration
  ]);

  const stopTimer = () => setIsCounting(false);
  const resumeTimer = () => setIsCounting(true);
  const quitTimer = () => {
    stopTimer(); navigation.goBack();
  };
  const startTimer = useCallback(
    () => {
      setCurrentSetsLeft(numSets);
      setTimer(DEFAULT_START_DURATION);
      setStatus(TIMER_STATUS.START);
      resumeTimer();
    },
    [numSets],
  );

  // ComponentDidMount
  useEffect(() => {
    startTimer();
  }, [startTimer]);

  // Render
  const PanelOptions = () => {
    if (isCounting) {
      return <Button label="Stop" onPress={stopTimer} />;
    }

    if (status !== TIMER_STATUS.FINISHED) {
      return (
        <>
          <Button label="Resume" onPress={resumeTimer} />
          <Button label="Quit" onPress={quitTimer} />
        </>
      );
    }

    return (
      <>
        <Button
          label="Restart"
          onPress={startTimer}
        />
        <Button label="Quit" onPress={quitTimer} />
      </>
    );
  };

  return (
    <View styles={styles.container}>
      <View style={styles.horizontalBreak} />
      <Text center>
        {`Set #${currentSetsLeft} - ${status}`}
      </Text>
      <Text style={{ marginHorizontal: 15, fontSize: 30, fontWeight: 'bold' }} center>{printTimer(timer)}</Text>
      <PanelOptions />
    </View>
  );
};

export default TimerScreen;
