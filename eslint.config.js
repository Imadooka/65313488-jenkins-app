export default [
    {
      ignores: ["node_modules/**"],
    },
    {
      languageOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      rules: {
        ...require("eslint/conf/eslint-recommended"),
      },
    },
  ];
  