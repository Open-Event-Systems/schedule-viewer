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
  vendorIcon: "Map-vendor-icon",
  vendorIconPrefix: "Map-vendor-icon-id-",
  vendorName: "Map-vendor-name",
  vendorNamePrefix: "Map-vendor-name-id-",
  isometric: "Map-isometric",
  isometricTransform: "Map-isometric-transform",
  isometricTransitionFinished: "Map-isometric-transition-finished",
  isometricTransitionHidden: "Map-isometric-transition-hidden",
  noIsometricTransition: "Map-no-isometric-transition",
  visible: "Map-visible",
  hidden: "Map-hidden",
  highlight: "Map-highlight",
  foreignObjectText: "Map-foreignObjectText",
  flagPrefix: "Map-flag-id-",
  eventName: "Map-event-name",
  eventNamePrefix: "Map-event-name-id-",
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
