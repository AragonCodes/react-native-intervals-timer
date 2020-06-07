import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput
} from 'react-native';
import Dialog from 'react-native-dialog';

const withLeadingZero = (seconds) => (seconds >= 10 ? seconds : `0${seconds}`);
const printMinutesSeconds = (seconds) => `${Math.floor(seconds / 60)}:${withLeadingZero(seconds % 60)}`;
const printTimer = (seconds) => ((seconds >= 60) ? printMinutesSeconds(seconds) : `${seconds}`);

const STATUS_COUNTDOWN = {
  HOME: 'HOME',
  WORK: 'WORK',
  REST: 'REST',
  FINISHED: 'FINISHED'
};
const DEFAULT_SET_COUNT = 1;
const DEFAULT_WORK_DURATION = 5;
const DEFAULT_REST_DURATION = 5;

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
        <TouchableOpacity style={styles.toggleButton} onPress={decreaseState}>
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

const Button = ({ label, onPress }) => (
  <TouchableOpacity style={styles.button} onPress={onPress}>
    <Text style={styles.buttonText}>{label}</Text>
  </TouchableOpacity>
);

export default function App() {
  // Saved Intervals
  const [savedIntervalSettings, setSavedIntervalSettings] = useState([]);
  const [intervalSaveName, setIntervalSaveName] = useState('');
  const [isSaveDialogShown, setIsSaveDialogShown] = useState(false);

  const saveIntervalSettings = () => {
    if (
      intervalSaveName
      && !savedIntervalSettings.find((save) => save.name === intervalSaveName)
    ) {
      setSavedIntervalSettings([...savedIntervalSettings, {
        name: intervalSaveName,
        sets: setsCount,
        work: workDuration,
        rest: restDuration
      }]);
      setIntervalSaveName('');
      setIsSaveDialogShown(false);
    }
  };

  // Config Interval Settings
  const [workDuration, setWorkDuration] = useState(DEFAULT_WORK_DURATION);
  const [restDuration, setRestDuration] = useState(DEFAULT_REST_DURATION);
  const [setsCount, setSetsCount] = useState(DEFAULT_SET_COUNT);

  // Active Interval Settings
  const [currentSetsLeft, setCurrentSetsLeft] = useState(0);
  const [currentWorkDuration, setCurrentWorkDuration] = useState(0);
  const [currentRestDuration, setCurrentRestDuration] = useState(0);
  const [countdownStatus, setCountdownStatus] = useState(STATUS_COUNTDOWN.HOME);

  const [isCounting, setIsCounting] = useState(false);
  const stopTimer = () => setIsCounting(false);
  const resumeTimer = () => setIsCounting(true);

  const [timer, setTimer] = useState(workDuration);
  const timerTick = () => setTimer((state) => ((state - 1) > 0 ? state - 1 : 0));

  useEffect(() => {
    let timeout;

    if (!isCounting && timeout) {
      clearTimeout(timeout);
    }

    if (isCounting) {
      timeout = setTimeout(() => {
        timerTick();
        if (timer - 1 === 0) {
          if (countdownStatus === STATUS_COUNTDOWN.WORK) {
            if (currentSetsLeft > 1) {
              setTimer(currentRestDuration);
              setCountdownStatus(STATUS_COUNTDOWN.REST);
            } else {
              setCountdownStatus(STATUS_COUNTDOWN.FINISHED);
              stopTimer();
            }
          } else if (countdownStatus === STATUS_COUNTDOWN.REST) {
            setTimer(currentWorkDuration);
            setCountdownStatus(STATUS_COUNTDOWN.WORK);
            setCurrentSetsLeft((status) => status - 1);
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
    countdownStatus,
    currentSetsLeft,
    currentRestDuration,
    currentWorkDuration
  ]);

  const startTimer = ({
    sets,
    rest,
    work
  }) => {
    setCurrentSetsLeft(sets);
    setCurrentRestDuration(rest);
    setCurrentWorkDuration(work);
    setTimer(work);
    setCountdownStatus(STATUS_COUNTDOWN.WORK);
    resumeTimer();
  };

  const quitCountdown = () => {
    stopTimer();
    setCountdownStatus(STATUS_COUNTDOWN.HOME);
  };

  const renderActiveTimerPanel = () => {
    if (countdownStatus === STATUS_COUNTDOWN.HOME) { return null; }

    const PanelOptions = () => {
      if (isCounting) {
        return <Button label="Stop" onPress={stopTimer} />;
      }

      if (countdownStatus !== STATUS_COUNTDOWN.FINISHED) {
        return (
          <>
            <Button label="Resume" onPress={resumeTimer} />
            <Button label="Quit" onPress={quitCountdown} />
          </>
        );
      }

      return (
        <>
          <Button
            label="Restart"
            onPress={() => startTimer({
              sets: setsCount,
              work: workDuration,
              rest: restDuration
            })}
          />
          <Button label="Quit" onPress={quitCountdown} />
        </>
      );
    };

    return (
      <View styles={styles.container}>
        <Text>
          {`Set #${currentSetsLeft}`}
        </Text>
        <Text style={styles.indicatorLabel}>
          {countdownStatus}
        </Text>
        <Text style={{ marginHorizontal: 15, fontSize: 30, fontWeight: 'bold' }}>{printTimer(timer)}</Text>
        <PanelOptions />
      </View>
    );
  };

  return (
    <>
      <View style={styles.container}>
        <Control label="SETS" field={setsCount} updateField={setSetsCount} />
        <Control
          label="WORK"
          field={workDuration}
          updateField={setWorkDuration}
          renderField={printMinutesSeconds}
        />
        <Control
          label="REST"
          field={restDuration}
          updateField={setRestDuration}
          renderField={printMinutesSeconds}
        />
        <Button
          label="SAVE"
          onPress={() => setIsSaveDialogShown(true)}
        />
        {
          (countdownStatus === STATUS_COUNTDOWN.HOME)
          && (
            <Button
              label="Start Timer"
              onPress={() => startTimer({
                sets: setsCount,
                work: workDuration,
                rest: restDuration
              })}
            />
          )
        }
        <View style={styles.horizontalBreak} />
        {
          savedIntervalSettings.map((save, i) => (
            <View key={save.name}>
              <Text>{save.name}</Text>
            </View>
          ))
        }
        <View style={styles.horizontalBreak} />
        {renderActiveTimerPanel()}
        <Dialog.Container visible={isSaveDialogShown}>
          <Dialog.Title>Name</Dialog.Title>
          <TextInput
            placeholder="Name"
            onChangeText={(text) => setIntervalSaveName(text)}
            defaultValue={intervalSaveName}
          />
          <Dialog.Button label="Cancel" onPress={() => setIsSaveDialogShown(false)} />
          <Dialog.Button label="Save" onPress={saveIntervalSettings} />
        </Dialog.Container>
      </View>
    </>
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
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 150,
    marginBottom: 20
  }
});
