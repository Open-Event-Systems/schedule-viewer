import { Box, Loader } from "@mantine/core"

import classes from "./loading.module.scss"
import clsx from "clsx"

export const Loading = () => {
  return (
    <Box className={clsx("Loading-root", classes.root)}>
      <Loader
        className={clsx("Loading-loader", classes.loader)}
        size="xl"
        type="dots"
      />
    </Box>
  )
}
