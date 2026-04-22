import { makePrefixFunc } from "../svg/classes.js"

export const mapViewerClassNames = {
  visible: "MapViewer-visible",
  object: "MapViewer-object",
  objectType: makePrefixFunc("MapViewer-object-type-"),
  objectIsometric: "MapViewer-object-isometric",
  objectIsometricTransform: "MapViewer-object-isometric-transform",
  objectNoIsometricTransition: "MapViewer-object-no-isometric-transition",
  level: "MapViewer-level",
  levelId: makePrefixFunc("MapViewer-level-id-"),
  levelActive: "MapViewer-level-active",
} as const
