import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text as TextNative,
  View,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  AsyncStorage
} from 'react-native';
import Dialog from 'react-native-dialog';
import { getStatusBarHeight } from 'react-native-status-bar-height';

// Storage
const Storage = {
  async getPresets() {
    const presetsNames = await this.getPresetsNames();
    const presets = await Promise.all(presetsNames.map(async (presetName) => {
      const preset = await this.getPreset(presetName);
      return preset;
    }));
    return presets;
  },

  async getPresetsNames() {
    const presetsNamesString = await AsyncStorage.getItem(this.KEY_PRESETS_NAMES);
    const presetsNames = JSON.parse(presetsNamesString);
    if (!presetsNames) {
      return [];
    }

    return presetsNames;
  },

  async savePresetsNames(names) {
    const presetsNamesString = JSON.stringify(names);
    await await AsyncStorage.setItem(this.KEY_PRESETS_NAMES, presetsNamesString);
  },

  async getPreset(presetName) {
    const presetKey = `${this.KEY_HEADER_PRESET}-${presetName}`;
    const presetString = await AsyncStorage.getItem(presetKey);
    const preset = JSON.parse(presetString);
    return preset;
  },

  async savePreset({
    name, sets, work, rest
  }) {
    const preset = {
      name,
      sets,
      work,
      rest
    };

    const presetKey = `${this.KEY_HEADER_PRESET}-${name}`;
    const presetString = JSON.stringify(preset);
    await AsyncStorage.setItem(presetKey, presetString);

    const presetsNames = await this.getPresetsNames();
    if (!presetsNames.find((presetName) => presetName === name)) {
      await this.savePresetsNames([...presetsNames, name]);
    }
  },

  async deletePreset({ name }) {
    const presetKey = `${this.KEY_HEADER_PRESET}-${name}`;
    await AsyncStorage.removeItem(presetKey);
    const presetsNames = await this.getPresetsNames();
    await this.savePresetsNames(
      presetsNames.filter((presetName) => presetName !== name)
    );
  },

  // CONSTANTS
  KEY_PRESETS_NAMES: 'KEY_PRESETS_NAMES',
  KEY_HEADER_PRESET: 'KEY_HEADER_PRESET'
};

// App
const withLeadingZero = (seconds) => (seconds >= 10 ? seconds : `0${seconds}`);
const printMinutesSeconds = (seconds) => `${Math.floor(seconds / 60)}:${withLeadingZero(seconds % 60)}`;
const printTimer = (seconds) => ((seconds >= 60) ? printMinutesSeconds(seconds) : `${seconds}`);

const STATUS_COUNTDOWN = {
  HOME: 'HOME',
  START: 'START',
  WORK: 'WORK',
  REST: 'REST',
  FINISHED: 'FINISHED'
};
const DEFAULT_SET_COUNT = 1;
const DEFAULT_WORK_DURATION = 5;
const DEFAULT_REST_DURATION = 5;
const DEFAULT_START_DURATION = 5;

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

const Button = ({ label, onPress }) => (
  <TouchableOpacity style={styles.button} onPress={onPress}>
    <Text style={styles.buttonText}>{label}</Text>
  </TouchableOpacity>
);

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

export default function App() {
  // Presets
  const [inputPresetNameValue, setInputPresetNameValue] = useState('');
  const [inputPresetNameFeedback, setInputPresetNameFeedback] = useState('');
  const [isSavePresetDialogShown, setIsSavePresetDialogShown] = useState(false);
  const [isDeletePresetDialogShown, setIsDeletePresetDialogShown] = useState(false);
  const [currentDeletingPreset, setCurrentDeletingPreset] = useState(null);
  const [presets, setPresets] = useState([]);

  useEffect(() => {
    const fetchPresets = async () => {
      try {
        const storedPresets = await Storage.getPresets();
        setPresets(storedPresets);
      } catch (error) {
        console.error(error);
      }
    };
    fetchPresets();
  }, []);

  const savePreset = async () => {
    if (!inputPresetNameValue) {
      setInputPresetNameFeedback('Enter a name.');
    } else if (presets.find((preset) => preset.name === inputPresetNameValue)) {
      setInputPresetNameFeedback('Name already exists.');
    } else {
      try {
        const preset = {
          name: inputPresetNameValue,
          sets: setsCount,
          work: workDuration,
          rest: restDuration
        };
        await Storage.savePreset(preset);
        setPresets([...presets, preset]);
        setInputPresetNameValue('');
        setInputPresetNameFeedback('');
        setIsSavePresetDialogShown(false);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const deletePreset = async (preset) => {
    try {
      await Storage.deletePreset(preset);
      setPresets(presets.filter((p) => p.name !== preset.name));
    } catch (error) {
      console.error(error);
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
          } else if (
            countdownStatus === STATUS_COUNTDOWN.START
            || countdownStatus === STATUS_COUNTDOWN.REST
          ) {
            setTimer(currentWorkDuration);
            setCountdownStatus(STATUS_COUNTDOWN.WORK);
            if (countdownStatus === STATUS_COUNTDOWN.REST) {
              setCurrentSetsLeft((status) => status - 1);
            }
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
    setTimer(DEFAULT_START_DURATION);
    setCountdownStatus(STATUS_COUNTDOWN.START);
    resumeTimer();
  };

  const quitCountdown = () => {
    stopTimer();
    setCountdownStatus(STATUS_COUNTDOWN.HOME);
  };

  // View
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
        <Text center>
          {`Set #${currentSetsLeft} - ${countdownStatus}`}
        </Text>
        <Text style={{ marginHorizontal: 15, fontSize: 30, fontWeight: 'bold' }} center>{printTimer(timer)}</Text>
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
                  onPress={() => {
                    setCurrentDeletingPreset(preset);
                    setIsDeletePresetDialogShown(true);
                  }}
                />
              </View>
            </View>
          ))
        }
      </View>
    );
  };

  const DialogSavePreset = () => {
    console.log('Rendering DialogSavePreset');
    return (
      <Dialog.Container visible={isSavePresetDialogShown}>
        <Dialog.Title>Save Preset</Dialog.Title>
        <Dialog.Input
          placeholder="Name"
          onChangeText={(text) => { console.log(text); setInputPresetNameValue(text); }}
          defaultValue={inputPresetNameValue}
        />
        {
        inputPresetNameFeedback
        && <Text style={{ color: 'red' }}>{inputPresetNameFeedback}</Text>
      }
        <Dialog.Button
          label="Cancel"
          onPress={() => {
            setInputPresetNameValue('');
            setIsSavePresetDialogShown(false);
          }}
        />
        <Dialog.Button label="Save" style={{ color: 'blue' }} onPress={savePreset} />
      </Dialog.Container>
    );
  };

  const DialogDeletePreset = () => {
    console.log('Rendering DialogDeletePreset');
    if (!currentDeletingPreset) {
      return null;
    }

    return (
      <Dialog.Container visible={isDeletePresetDialogShown}>
        <Dialog.Title>{`Delete Preset - ${currentDeletingPreset.name}`}</Dialog.Title>
        <Dialog.Button label="Cancel" onPress={() => setIsDeletePresetDialogShown(false)} />
        <Dialog.Button
          label="Delete"
          style={{ color: 'red' }}
          onPress={() => {
            deletePreset(currentDeletingPreset);
            setIsDeletePresetDialogShown(false);
          }}
        />
      </Dialog.Container>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.wrapper}>
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

        {/* off-screen */}
        <DialogSavePreset />
        <DialogDeletePreset />
      </View>
    </ScrollView>
  );
}

// Styles
const ScreenWidth = Dimensions.get('window').width;
const StatusBarHeight = getStatusBarHeight();
const WrapperPadding = 5;
const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: WrapperPadding,
    paddingTop: (StatusBarHeight + WrapperPadding),
  },
  container: {
    width: ScreenWidth,
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
    marginVertical: 10,
    alignSelf: 'center'
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
