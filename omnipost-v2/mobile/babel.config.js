// babel.config.js
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['module-resolver', { root: ['./src'], extensions: ['.ts', '.tsx', '.js', '.jsx'] }],
    'react-native-reanimated/plugin',
  ],
};
