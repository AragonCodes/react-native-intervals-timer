import { AsyncStorage } from 'react-native';

const uuid = () => Date.now();

const Storage = {
  async getPresets() {
    const presetsIds = await this.getPresetsIds();
    const presets = await Promise.all(presetsIds.map(async (presetId) => {
      const preset = await this.getPreset(presetId);
      return preset;
    }));
    return presets;
  },

  async getPresetsIds() {
    const presetsIdsString = await AsyncStorage.getItem(this.KEY_PRESETS_IDS);
    const presetsIds = JSON.parse(presetsIdsString);
    if (!presetsIds) {
      return [];
    }

    return presetsIds;
  },

  async savePresetsIds(ids) {
    const presetsIdsString = JSON.stringify(ids);
    await AsyncStorage.setItem(this.KEY_PRESETS_IDS, presetsIdsString);
  },

  async getPreset(id) {
    const presetKey = `${this.KEY_HEADER_PRESET}-${id}`;
    const presetString = await AsyncStorage.getItem(presetKey);
    const preset = JSON.parse(presetString);
    return preset;
  },

  async savePreset({
    name, sets, work, rest
  }) {
    const presetId = uuid();
    const preset = {
      id: presetId,
      name,
      sets,
      work,
      rest
    };

    const presetKey = `${this.KEY_HEADER_PRESET}-${presetId}`;
    const presetString = JSON.stringify(preset);
    await AsyncStorage.setItem(presetKey, presetString);

    const presetsIds = await this.getPresetsIds();
    await this.savePresetsIds([...presetsIds, presetId]);
    return preset;
  },

  async updatePreset(preset) {
    const presetKey = `${this.KEY_HEADER_PRESET}-${preset.id}`;
    const presetString = JSON.stringify(preset);
    await AsyncStorage.setItem(presetKey, presetString);
    return preset;
  },

  async deletePreset({ id }) {
    const presetKey = `${this.KEY_HEADER_PRESET}-${id}`;
    await AsyncStorage.removeItem(presetKey);
    const presetsIds = await this.getPresetsIds();
    await this.savePresetsIds(
      presetsIds.filter((presetId) => presetId !== id)
    );
  },

  // CONSTANTS
  KEY_PRESETS_IDS: 'KEY_PRESETS_IDS',
  KEY_HEADER_PRESET: 'KEY_HEADER_PRESET'
};

export default Storage;
