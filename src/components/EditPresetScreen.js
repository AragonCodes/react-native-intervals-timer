import React, { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  View,
  ScrollView,
  TextInput
} from 'react-native';
import { Text, Button, Control } from './common/index';
import PresetStorage from '../modules/presetStorage';
import globalStyles, { ScreenWidth } from '../style';

import { printMinutesSeconds } from '../modules/format';

export const MODIFIED_PRESET_ACTION_TYPE = {
  DELETE: 'DELETE',
  UPDATE: 'UPDATE'
};

const EditPresetScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    id,
    name: previousName,
    sets: previousNumSets,
    work: previousWorkDuration,
    rest: previousRestDuration
  } = route.params;

  const [name, setName] = useState(previousName);
  const [workDuration, setWorkDuration] = useState(previousWorkDuration);
  const [restDuration, setRestDuration] = useState(previousRestDuration);
  const [numSets, setNumSets] = useState(previousNumSets);
  const [feedback, setFeedback] = useState('');

  // Actions
  const updatePreset = async () => {
    if (!name) {
      setFeedback('Enter a name.');
    } else {
      try {
        const presetData = {
          id,
          name,
          sets: numSets,
          work: workDuration,
          rest: restDuration
        };
        const preset = await PresetStorage.updatePreset(presetData);

        const modifiedPresetAction = {
          type: MODIFIED_PRESET_ACTION_TYPE.UPDATE,
          payload: { preset }
        };
        navigation.navigate('Home', { modifiedPresetAction });
      } catch (error) {
        console.error(error);
      }
    }
  };

  const deletePreset = async () => {
    try {
      await PresetStorage.deletePreset({ id });
      const modifiedPresetAction = {
        type: MODIFIED_PRESET_ACTION_TYPE.DELETE,
        payload: { id }
      };
      navigation.navigate('Home', { modifiedPresetAction });
    } catch (error) {
      console.error(error);
    }
  };

  // Render
  return (
    <ScrollView contentContainerStyle={globalStyles.wrapper}>
      <View style={globalStyles.container}>
        <View style={{ borderBottomColor: 'grey', borderBottomWidth: 0.5 }}>
          <TextInput
            placeholder="Name"
            onChangeText={(text) => setName(text)}
            defaultValue={name}
            style={{ width: (ScreenWidth / 2) }}
          />
        </View>
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
        {
          !!feedback
          && <Text style={{ color: 'red' }} center>{feedback}</Text>
        }
        <View style={{ flexDirection: 'row' }}>
          <Button
            label="Delete"
            buttonStyle={{ backgroundColor: 'red', marginRight: 5 }}
            onPress={deletePreset}
          />

          <Button
            label="Save"
            onPress={updatePreset}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default EditPresetScreen;
