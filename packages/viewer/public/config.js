/** @type {import("../src/spa/config.js").SPAConfig} */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var scheduleConfig = {
  theme: {
    colors: {
      themePink: [
        "#ffe7eb",
        "#ffced4",
        "#ff9aa7",
        "#ff6477",
        "#ff475d",
        "#ff1834",
        "#ff0326",
        "#e4001a",
        "#cc0015",
        "#b3000f",
      ],
    },
    primaryColor: "themePink",
    primaryShade: 4,
    fontFamily: "'Fira Sans', sans-serif",
  },
  colorScheme: "dark",
  basePath: "/test-schedule-2026",
  serviceWorker: true,
  cacheURLs: [
    "map.css",
    "lower.svg",
    "lobby.svg",
    "2f.svg",
    "3f.svg",
    "4f.svg",
    "5f.svg",
  ],
  router: "browser",
}
