import { createRoot } from "react-dom/client"
import { App } from "./App.js"

import "@mantine/core/styles.css"
import "@open-event-systems/schedule-components/styles.scss"

document.addEventListener("DOMContentLoaded", () => {
  const scheduleEl = document.querySelector("[data-schedule]")
  if (scheduleEl) {
    const root = createRoot(scheduleEl)
    const app = (
      <App configURL={scheduleEl.getAttribute("data-schedule") ?? ""} />
    )
    root.render(app)
  }
})
