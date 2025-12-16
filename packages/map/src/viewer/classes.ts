export const mapViewerClassNames = {
  visible: "MapViewer-visible",
  object: "MapViewer-object",
  objectType: (typeId: string) => `MapViewer-object-type-${typeId}`,
  objectIsometric: "MapViewer-object-isometric",
  objectIsometricTransform: "MapViewer-object-isometric-transform",
  objectNoIsometricTransition: "MapViewer-object-no-isometric-transition",
  level: "MapViewer-level",
  levelId: (id: string) => `MapViewer-level-id-${id}`,
  levelActive: "MapViewer-level-active",
} as const
