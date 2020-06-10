import React, { useState, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  View,
  ScrollView,
  TextInput
} from 'react-native';
import Dialog from 'react-native-dialog';
import {
  Text, Button, Control
} from './common/index';
import PresetStorage from '../modules/presetStorage';
import styles from '../style';
import { printMinutesSeconds } from '../modules/format';
import { MODIFIED_PRESET_ACTION_TYPE } from './EditPresetScreen';

const DEFAULT_SET_COUNT = 1;
const DEFAULT_WORK_DURATION = 5;
const DEFAULT_REST_DURATION = 5;

const HomeScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // onPresetModified
  const modifiedPresetAction = (route.params)
    ? route.params.modifiedPresetAction
    : null;

  useEffect(() => {
    if (modifiedPresetAction) {
      const updatePresets = (action) => {
        const { type, payload } = action;
        switch (type) {
          case MODIFIED_PRESET_ACTION_TYPE.DELETE:
            setStoredPresets((presets) => presets.filter((preset) => preset.id !== payload.id));
            break;
          case MODIFIED_PRESET_ACTION_TYPE.UPDATE:
            setStoredPresets((presets) => presets.map((preset) => ((preset.id === payload.preset.id)
              ? payload.preset
              : preset)));
            break;
          default:
            throw new Error(`modifiedPresetAction type not identified: ${type}`);
        }
      };

      updatePresets(modifiedPresetAction);
    }
  }, [modifiedPresetAction]);

  // Presets
  const [inputPresetNameValue, setInputPresetNameValue] = useState('');
  const [inputPresetNameFeedback, setInputPresetNameFeedback] = useState('');
  const [isSavePresetDialogShown, setIsSavePresetDialogShown] = useState(false);
  const [storedPresets, setStoredPresets] = useState([]);

  useEffect(() => {
    const fetchPresets = async () => {
      try {
        const presets = await PresetStorage.getPresets();
        setStoredPresets(presets);
      } catch (error) {
        console.error(error);
      }
    };
    fetchPresets();
  }, []);

  const savePreset = async () => {
    if (!inputPresetNameValue) {
      setInputPresetNameFeedback('Enter a name.');
    } else {
      try {
        const preset = {
          name: inputPresetNameValue,
          sets: numSets,
          work: workDuration,
          rest: restDuration
        };
        await PresetStorage.savePreset(preset);
        setStoredPresets([...storedPresets, preset]);
        setInputPresetNameValue('');
        setInputPresetNameFeedback('');
        setIsSavePresetDialogShown(false);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const editPreset = async (preset) => {
    navigation.navigate('EditPreset', preset);
  };

  // Config Interval Settings
  const [workDuration, setWorkDuration] = useState(DEFAULT_WORK_DURATION);
  const [restDuration, setRestDuration] = useState(DEFAULT_REST_DURATION);
  const [numSets, setNumSets] = useState(DEFAULT_SET_COUNT);

  const startTimer = ({ sets, work, rest }) => {
    navigation.navigate('Timer', {
      sets,
      work,
      rest
    });
  };

  // Render
  const renderPresetsList = () => {
    if (!storedPresets.length) {
      return null;
    }

    return (
      <View style={styles.container}>
        <View style={styles.horizontalBreak} />
        {
          storedPresets.map((preset) => (
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
                  label="Edit"
                  onPress={() => editPreset(preset)}
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
          label="Save"
          onPress={() => setIsSavePresetDialogShown(true)}
        />
        <Button
          label="Start Timer"
          onPress={() => startTimer({
            sets: numSets,
            work: workDuration,
            rest: restDuration
          })}
        />
        {renderPresetsList()}

        {/* off-screen */}
        <Dialog.Container visible={isSavePresetDialogShown}>
          <Dialog.Title>Save Preset</Dialog.Title>
          <View style={{ borderBottomColor: 'grey', borderBottomWidth: 0.5 }}>
            <TextInput
              placeholder="Name"
              onChangeText={(text) => setInputPresetNameValue(text)}
              defaultValue={inputPresetNameValue}
            />
          </View>
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
      </View>
    </ScrollView>
  );
};

export default HomeScreen;
