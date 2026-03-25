import { ActionIcon, useProps, type ActionIconProps } from "@mantine/core"
import {
  IconDeviceMobileCheck,
  IconDeviceMobileDown,
  IconRefresh,
} from "@tabler/icons-react"
import clsx from "clsx"

import classes from "./sw-button.module.scss"

export type SWButtonProps = {
  swInstalling?: boolean
  swReady?: boolean
  pwaInstallAvailable?: boolean
  pwaInstalling?: boolean
  updateAvailable?: boolean
  onInstallPWA?: () => void
  onUpdate?: () => void
} & ActionIconProps

export const SWButton = (props: SWButtonProps) => {
  const {
    swInstalling,
    swReady,
    pwaInstallAvailable,
    pwaInstalling,
    updateAvailable,
    onInstallPWA,
    onUpdate,
    ...other
  } = useProps("SWButton", null, props)

  if (swInstalling) {
    return (
      <ActionIcon
        title="Preparing offline features"
        radius="xl"
        variant="subtle"
        className={clsx("SWButtons-statusInstalling", classes.statusInstalling)}
        loading
        {...other}
      >
        <IconDeviceMobileCheck />
      </ActionIcon>
    )
  } else if (pwaInstalling) {
    return (
      <ActionIcon
        title="Installing to device"
        radius="xl"
        variant="subtle"
        className={clsx("SWButtons-statusInstalling", classes.statusInstalling)}
        loading
        {...other}
      >
        <IconDeviceMobileDown />
      </ActionIcon>
    )
  } else if (updateAvailable) {
    return (
      <ActionIcon
        title="Update now"
        radius="xl"
        variant="subtle"
        className={clsx("SWButtons-statusInstall", classes.statusInstall)}
        onClick={(e) => {
          e.preventDefault()
          onUpdate && onUpdate()
        }}
        {...other}
      >
        <IconRefresh />
      </ActionIcon>
    )
  } else if (pwaInstallAvailable) {
    return (
      <ActionIcon
        title="Install to device"
        radius="xl"
        variant="subtle"
        className={clsx("SWButtons-statusInstall", classes.statusInstall)}
        onClick={(e) => {
          e.preventDefault()
          onInstallPWA && onInstallPWA()
        }}
        {...other}
      >
        <IconDeviceMobileDown />
      </ActionIcon>
    )
  } else if (swReady) {
    return (
      <ActionIcon
        disabled
        title="Offline ready"
        radius="xl"
        variant="subtle"
        className={clsx("SWButtons-statusReady", classes.statusReady)}
        {...other}
      >
        <IconDeviceMobileCheck />
      </ActionIcon>
    )
  }
}
