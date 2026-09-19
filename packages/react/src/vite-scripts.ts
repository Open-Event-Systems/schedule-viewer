/**
 * The scripts required for @vitejs/plugin-react.
 * @module
 */

export default [
  {
    type: "module",
    children: `
import RefreshRuntime from '/@react-refresh'
RefreshRuntime.injectIntoGlobalHook(window)
window.$RefreshReg$ = () => {}
window.$RefreshSig$ = () => (type) => type
window.__vite_plugin_react_preamble_installed__ = true`,
  },
  {
    type: "module",
    src: "/@vite/client",
  },
] as const
