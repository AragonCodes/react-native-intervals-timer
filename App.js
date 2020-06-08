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
        <TouchableOpacity style={[styles.toggleButton, { paddingBottom: 3 }]} onPress={decreaseState}>
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
  const [presets, setPresets] = useState([]);
  const [inputPresetNameValue, setInputPresetNameValue] = useState('');
  const [inputPresetNameFeedback, setInputPresetNameFeedback] = useState('');
  const [isSavePresetDialogShown, setIsSavePresetDialogShown] = useState(false);

  const savePreset = () => {
    if (!inputPresetNameValue) {
      setInputPresetNameFeedback('Enter a name.');
    } else if (presets.find((preset) => preset.name === inputPresetNameValue)) {
      setInputPresetNameFeedback('Name already exists.');
    } else {
      setPresets([...presets, {
        name: inputPresetNameValue,
        sets: setsCount,
        work: workDuration,
        rest: restDuration
      }]);
      setInputPresetNameValue('');
      setInputPresetNameFeedback('');
      setIsSavePresetDialogShown(false);
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
        <View style={styles.horizontalBreak} />
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

  const renderPresetsList = () => {
    if (!presets.length) {
      return null;
    }

    return (
      <View style={styles.container}>
        <View style={styles.horizontalBreak} />
        {
          presets.map((preset) => (
            <View key={preset.name} style={{ flexDirection: 'row' }}>
              <View>
                <Text style={{ fontWeight: 'bold' }}>{preset.name}</Text>
                <Text>{`Sets: ${preset.sets}`}</Text>
                <Text>{`Work: ${preset.work}`}</Text>
                <Text>{`Rest: ${preset.rest}`}</Text>
              </View>
              <View>
                <Button
                  label="Select"
                  onPress={() => startTimer(preset)}
                />
                <Button
                  label="Delete"
                  onPress={() => setPresets(
                    presets.filter((p) => p.name !== preset.name)
                  )}
                />
              </View>
            </View>
          ))
        }
      </View>
    );
  };

  return (
    <>
      <View style={styles.wrapper}>
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
          onPress={() => setIsSavePresetDialogShown(true)}
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
        {renderPresetsList()}
        {renderActiveTimerPanel()}
        <Dialog.Container visible={isSavePresetDialogShown}>
          <Dialog.Title>Save Preset</Dialog.Title>
          <TextInput
            placeholder="Name"
            onChangeText={(text) => setInputPresetNameValue(text)}
            defaultValue={inputPresetNameValue}
          />
          {
            inputPresetNameFeedback
            && <Text style={{ color: 'red' }}>{inputPresetNameFeedback}</Text>
          }
          <Dialog.Button label="Cancel" onPress={() => setIsSavePresetDialogShown(false)} />
          <Dialog.Button label="Save" onPress={savePreset} />
        </Dialog.Container>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
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
