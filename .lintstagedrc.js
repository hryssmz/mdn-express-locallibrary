module.exports = {
  "src/**/*.{js,ts}": ["eslint --max-warnings=0", "prettier --check"],
  "*.{css,html,json,md,yml}": ["prettier --check"],
};
