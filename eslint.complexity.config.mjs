import sonarjs from 'eslint-plugin-sonarjs';

export default [{
  files: ['**/*.js'],
  plugins: {sonarjs},
  rules: {'sonarjs/cognitive-complexity': ['error', 1]}
}];
