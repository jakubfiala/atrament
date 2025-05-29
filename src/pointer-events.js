const pointerEventHandler = (handler, config) => (event) => {
  // Ignore pointers such as additional touches on a multi-touch screen
  if (!event.isPrimary || (!config.secondaryMouseButton && event.button > 0)
    || (config.ignoreModifiers && (event.altKey || event.ctrlKey || event.metaKey))) {
    return;
  }

  if (event.cancelable) {
    event.preventDefault();
  }

  handler(event);
};

export const setupPointerEvents = ({
  canvas,
  move,
  down,
  up,
}, config) => {
  const moveListener = pointerEventHandler(move, config);
  const downListener = pointerEventHandler(down, config);
  const upListener = pointerEventHandler(up, config);

  canvas.addEventListener('pointermove', moveListener);
  canvas.addEventListener('pointerdown', downListener);
  document.addEventListener('pointerup', upListener);
  document.addEventListener('pointerout', upListener);

  return () => {
    canvas.removeEventListener('pointermove', moveListener);
    canvas.removeEventListener('pointerdown', downListener);
    document.removeEventListener('pointerup', upListener);
    document.removeEventListener('pointerout', upListener);
  };
};
