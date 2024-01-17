import floodFill from './flood';

globalThis.addEventListener('message', ({ data }) => {
  const result = floodFill(data);

  globalThis.postMessage({ type: 'fill-result', result }, [result.buffer]);
});
