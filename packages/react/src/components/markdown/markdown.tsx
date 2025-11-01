import { forwardRef, useMemo } from "react"
import markdownit from "markdown-it"
import {
  type BoxProps,
  createPolymorphicComponent,
  Typography,
} from "@mantine/core"
import clsx from "clsx"

export type MarkdownProps = { children?: string } & BoxProps

const _Markdown = forwardRef<HTMLDivElement, MarkdownProps>((props, ref) => {
  const { children = "", className, ...other } = props
  const markdown = useMemo(() => {
    const md = markdownit({
      breaks: true,
      typographer: true,
    })

    md.renderer.rules.link_open = (tokens, idx, options) => {
      const token = tokens[idx]
      token?.attrSet("target", "_blank")
      return md.renderer.renderToken(tokens, idx, options)
    }

    md.renderer.rules.link_close = (tokens, idx, options) => {
      return "↗" + md.renderer.renderToken(tokens, idx, options)
    }

    return md
  }, [])

  const result = useMemo(() => markdown.render(children), [children])

  return (
    <Typography
      component="div"
      className={clsx("Markdown-root", className)}
      ref={ref}
      {...other}
      dangerouslySetInnerHTML={{ __html: result }}
    />
  )
})

_Markdown.displayName = "Markdown"

export const Markdown = createPolymorphicComponent<"div", MarkdownProps>(
  _Markdown,
)
