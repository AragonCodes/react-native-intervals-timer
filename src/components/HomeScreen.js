import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  ScrollView,
} from 'react-native';
import Dialog from 'react-native-dialog';
import { Text, Button, Control } from './common/index';
import PresetStorage from '../modules/presetStorage';
import styles from '../style';
import { printMinutesSeconds } from '../modules/format';

const DEFAULT_SET_COUNT = 1;
const DEFAULT_WORK_DURATION = 5;
const DEFAULT_REST_DURATION = 5;

// Components
const HomeScreen = () => {
  const navigation = useNavigation();

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
        const storedPresets = await PresetStorage.getPresets();
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
          sets: numSets,
          work: workDuration,
          rest: restDuration
        };
        await PresetStorage.savePreset(preset);
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
      await PresetStorage.deletePreset(preset);
      setPresets(presets.filter((p) => p.name !== preset.name));
    } catch (error) {
      console.error(error);
    }
  };

  // Config Interval Settings
  const [workDuration, setWorkDuration] = useState(DEFAULT_WORK_DURATION);
  const [restDuration, setRestDuration] = useState(DEFAULT_REST_DURATION);
  const [numSets, setNumSets] = useState(DEFAULT_SET_COUNT);

  const startTimer = () => {
    navigation.navigate('Timer', {
      numSets,
      workDuration,
      restDuration
    });
  };

  // Render
  const renderPresetsList = () => {
    if (!presets.length) {
      return null;
    }

    return (
      <View style={styles.container}>
        <View style={styles.horizontalBreak} />
        {
          presets.map((preset) => (
            <View key={preset.id} style={{ flexDirection: 'row' }}>
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

  return (
    <ScrollView contentContainerStyle={styles.wrapper}>
      <View style={styles.container}>
        <Control label="SETS" field={numSets} updateField={setNumSets} />
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
        <Button
          label="Start Timer"
          onPress={startTimer}
        />
        {renderPresetsList()}

        {/* off-screen */}
        <Dialog.Container visible={isSavePresetDialogShown}>
          <Dialog.Title>Save Preset</Dialog.Title>
          <Dialog.Input
            placeholder="Name"
            onChangeText={(text) => setInputPresetNameValue(text)}
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
        { currentDeletingPreset
          && (
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
          )}
      </View>
    </ScrollView>
  );
};

export default HomeScreen;
