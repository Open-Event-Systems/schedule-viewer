import { Box, Loader } from "@mantine/core"

import classes from "./loading.module.scss"
import clsx from "clsx"

export const LoadingRoute = () => {
  return (
    <Box className={clsx("Loading-root", classes.root)}>
      <Loader type="dots" />
    </Box>
  )
}
