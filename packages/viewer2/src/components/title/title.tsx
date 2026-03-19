import { useRouterState } from "@tanstack/react-router"

export const PageTitle = () => {
  const title = useRouterState({
    select: (state) => {
      for (let i = state.matches.length - 1; i >= 0; i--) {
        const match = state.matches[i]
        if (match && "config" in match.context) {
          return match.context.config.title
        }
      }
    },
  })

  return <>{title}</>
}
