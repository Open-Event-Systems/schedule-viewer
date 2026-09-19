import { Box, Loader } from "@mantine/core"
import clsx from "clsx"

import classes from "./loading.module.scss"

export const LoadingRoute = () => {
  return (
    <Box className={clsx("Loading-root", classes.root)}>
      <Loader type="dots" />
    </Box>
  )
}
