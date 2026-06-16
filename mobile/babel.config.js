module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    env: {
      test: {
        // Jest runs on CommonJS without --experimental-vm-modules, so
        // transform dynamic import() (used e.g. in auth-store.test.ts) into
        // a require()-based equivalent. Metro handles dynamic import
        // natively, so this is scoped to the test env only.
        plugins: ["@babel/plugin-transform-dynamic-import"],
      },
    },
  };
};
