import terser from '@rollup/plugin-terser';
import webWorkerLoader from 'rollup-plugin-web-worker-loader';

export default {
  input: {
    index: 'src/index.js',
    fill: 'src/fill/index.js',
  },
  output: [
    {
      dir: 'dist/esm',
      plugins: [
        terser(),
      ],
    },
    {
      dir: 'dist/cjs',
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
