const pointerEventHandler = (handler) => (event) => {
  // Ignore pointers such as additional touches on a multi-touch screen
  if (!event.isPrimary) {
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
}) => {
  const moveListener = pointerEventHandler(move);
  const downListener = pointerEventHandler(down);
  const upListener = pointerEventHandler(up);

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
