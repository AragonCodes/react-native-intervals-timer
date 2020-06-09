import { StyleSheet, Dimensions } from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';

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
  horizontalBreak: {
    borderBottomColor: '#888',
    width: '95%',
    borderWidth: 0.5,
    marginVertical: 5
  },
});

export default styles;
