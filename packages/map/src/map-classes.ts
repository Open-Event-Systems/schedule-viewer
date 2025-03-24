export const MAP_CLASSES = {
  level: "Map-level",
  levelPrefix: "Map-level-id-",
  marker: "Map-marker",
  markerPrefix: "Map-marker-id-",
  area: "Map-area",
  areaPrefix: "Map-area-id-",
  click: "Map-click",
  clickPrefix: "Map-click-id-",
  layer: "Map-layer",
  layerPrefix: "Map-layer-id-",
  isometric: "Map-isometric",
  isometricTransform: "Map-isometric-transform",
  isometricTransformFinished: "Map-isometric-transform-finished",
  visible: "Map-visible",
  hidden: "Map-hidden",
  highlight: "Map-highlight",
} as const

export const getMapClass = (prefix: string, id: string): string => {
  return `${prefix}${id}`
}

export const getIDFromMapClass = (
  prefix: string,
  cls: string,
): string | undefined => {
  if (cls.startsWith(prefix)) {
    return cls.substring(prefix.length)
  }
}
