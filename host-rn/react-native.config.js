module.exports = {
  commands: require('@callstack/repack/commands'),
  // fontes ligadas no iOS (Info.plist UIAppFonts + recursos do Xcode) pelo react-native-asset;
  // iosAssets para não mexer no android/ (fora do escopo)
  iosAssets: ['./assets/fonts'],
}
