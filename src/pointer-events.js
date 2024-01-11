const pointerEventHandler = (handler) => (event) => {
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

  return {
    removePointerEventListeners: () => {
      canvas.removeEventListener('pointermove', moveListener);
      canvas.removeEventListener('pointerdown', downListener);
      document.removeEventListener('pointerup', upListener);
    },
  };
};
