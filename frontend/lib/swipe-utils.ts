export interface SwipeDirection {
  x: number
  y: number
}

export const getSwipeDirection = (deltaX: number, deltaY: number): "left" | "right" | "up" | null => {
  const threshold = 50

  if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY < -threshold) {
    return "up"
  }

  if (Math.abs(deltaX) > threshold) {
    return deltaX > 0 ? "right" : "left"
  }

  return null
}

export const calculateRotation = (deltaX: number, maxRotation = 15): number => {
  const maxDelta = 200
  return (deltaX / maxDelta) * maxRotation
}
