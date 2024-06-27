import terser from '@rollup/plugin-terser';
import webWorkerLoader from 'rollup-plugin-web-worker-loader';

export default {
  input: 'src/index.js',
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
      exports: 'named',
    },
  ],
  plugins: [
    webWorkerLoader({
      targetPlatform: 'browser',
    }),
  ],
};
