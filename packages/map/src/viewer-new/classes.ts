export const mapViewerClassNames = {
  visible: "MapViewer-visible",
  level: "MapViewer-level",
  levelId: (id: string) => `MapViewer-level-id-${id}`,
  levelActive: "MapViewer-level-active",
  levelIsometric: "MapViewer-level-isometric",
  levelIsometricTransform: "MapViewer-level-isometric-transform",
  levelNoIsometricTransition: "MapViewer-level-no-isometric-transition",
} as const
