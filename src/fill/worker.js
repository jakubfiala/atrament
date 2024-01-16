import floodFill from './flood';

const onMessage = ({ data }) => {
  const result = floodFill(data);
  globalThis.postMessage({ type: 'fill-result', result }, [result.buffer]);
};

globalThis.addEventListener('message', onMessage);
