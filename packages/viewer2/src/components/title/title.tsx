import { useRouterState } from "@tanstack/react-router"

export const PageTitle = () => {
  const title = useRouterState({
    select: (state) => {
      for (let i = state.matches.length - 1; i >= 0; i--) {
        const match = state.matches[i]
        if (match) {
          if (match.status == "notFound") {
            return "Not Found"
          } else if ("pageTitle" in match.context && match.context.pageTitle) {
            return match.context.pageTitle
          }
        }
      }
    },
  })

  return <>{title || "Schedule"}</>
}
