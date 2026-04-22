export const removeInlineDisplay = (el: Element) => {
  if (el instanceof SVGElement && el.style.display) {
    el.style.display = ""
  }
}
