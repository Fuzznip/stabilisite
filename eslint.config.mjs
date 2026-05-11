import nextConfig from "eslint-config-next";

const eslintConfig = [
  { ignores: ["functions/**"] },
  ...nextConfig,
];

export default eslintConfig;
