/**
 * Mock for react-native-css-interop/jsx-runtime and jsx-dev-runtime.
 *
 * NativeWind v4 configures babel-preset-expo to use react-native-css-interop's
 * JSX transform (jsxImportSource: "nativewind"), which cannot run in a Jest/Node
 * environment because it imports native RN appearance APIs.
 *
 * This mock redirects to React's standard jsx-runtime so that component tests
 * can render NativeWind-styled components without the native runtime. The
 * `className` prop is passed through as a regular prop and ignored gracefully
 * by the RN component mocks provided by react-native's jest preset.
 */
module.exports = require("react/jsx-runtime");
