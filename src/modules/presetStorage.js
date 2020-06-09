import { AsyncStorage } from 'react-native';

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

export default Storage;
