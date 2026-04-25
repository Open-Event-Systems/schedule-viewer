type PrefixFunc<P extends string> = (<S extends string>(id: S) => `${P}${S}`) &
  Readonly<{
    parse: {
      <S extends string>(className: `${P}${S}`): S
      (className: string): string | undefined
    }
  }>

export const makePrefixFunc = <P extends string>(prefix: P): PrefixFunc<P> => {
  const func = <S extends string>(id: S): `${P}${S}` => `${prefix}${id}`
  func.parse = (className: string): string | undefined => {
    if (className.startsWith(prefix)) {
      return className.slice(prefix.length)
    } else {
      return
    }
  }

  return func
}

export const mapSVGClassNames = {
  layer: "Map-layer",
  layerId: makePrefixFunc("Map-layer-id-"),
  area: "Map-area",
  areaId: makePrefixFunc("Map-area-id-"),
  click: "Map-click",
  clickId: makePrefixFunc("Map-click-id-"),
  locationTitle: "Map-location-title",
  locationTitleId: makePrefixFunc("Map-location-title-id-"),
  locationIcon: "Map-location-icon",
  locationIconId: makePrefixFunc("Map-location-icon-id-"),
  flagId: makePrefixFunc("Map-flag-id-"),
  flagTransition: "Map-flag-transition",
  flagTransitionId: makePrefixFunc("Map-flag-transition-id-"),
  flagTransitionForward: "Map-flag-transition-forward",
  flagTransitionBackward: "Map-flag-transition-backward",
  flagTransitionFinished: "Map-flag-transition-finished",
  flagToggle: "Map-flag-toggle",
  flagToggleId: makePrefixFunc("Map-flag-toggle-id-"),
  foreignObjectText: "Map-foreignObjectText",
  isometric: "Map-isometric",
  isometricTransform: "Map-isometric-transform",
  isometricTransitionFinished: "Map-isometric-transition-finished",
  isometricTransitionHidden: "Map-isometric-transition-hidden",
  active: "Map-active",
  visible: "Map-visible",
  hidden: "Map-hidden",
  empty: "Map-empty",
} as const
