import terser from '@rollup/plugin-terser';

export default {
  input: 'index.js',
  output: [
    {
      file: 'dist/esm/index.js',
      plugins: [
        terser(),
      ],
    },
    {
      file: 'dist/cjs/index.js',
      format: 'cjs',
    },
  ],
};
