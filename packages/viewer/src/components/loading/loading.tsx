import { Box, Loader } from "@mantine/core"
import clsx from "clsx"

import classes from "./loading.module.scss"

export const Loading = () => {
  return (
    <Box className={clsx("Loading-root", classes.root)}>
      <Box className={clsx("Loading-container", classes.container)}>
        <Loader
          className={clsx("Loading-loader", classes.loader)}
          size="xl"
          type="dots"
        />
      </Box>
    </Box>
  )
}
