/**
 * Mock for the entire react-native-css-interop package.
 *
 * NativeWind v4 requires react-native-css-interop at multiple levels:
 * - As a JSX transform (jsx-runtime / jsx-dev-runtime)
 * - As a runtime import inside @react-native/virtualized-lists for className support
 *
 * None of these work in a Jest/Node environment because css-interop uses
 * native RN appearance APIs. This mock makes all imports of
 * react-native-css-interop return no-ops so that FlatList and other
 * components that were patched by NativeWind can still render in tests.
 *
 * The `className` prop is ignored gracefully — RN's mock components in Jest
 * just pass unknown props through without error.
 */

const React = require("react");

// re-export the JSX runtime (used by jsx-runtime / jsx-dev-runtime)
module.exports = {
  ...require("react/jsx-runtime"),
  // remapProps: NativeWind calls this to set up className->style remapping on components.
  // Return the component unchanged so it renders normally in tests.
  remapProps: (Component, _mapping) => Component,
  // cssInterop: same — just return the component
  cssInterop: (Component, _mapping) => Component,
  // withCSSInterop: same
  withCSSInterop: (Component, _mapping) => Component,
};
