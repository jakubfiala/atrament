const pointerEventHandler = (handler, instance) => (event) => {
  // Ignore pointers such as additional touches on a multi-touch screen
  if (!event.isPrimary || (!instance.secondaryMouseButton && event.button > 0)
    || (instance.ignoreModifiers
      && (event.altKey || event.ctrlKey || event.metaKey || event.button === 1))) {
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
}, instance) => {
  const moveListener = pointerEventHandler(move, instance);
  const downListener = pointerEventHandler(down, instance);
  const upListener = pointerEventHandler(up, instance);

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
