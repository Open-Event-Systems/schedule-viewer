import {
  ActionIcon,
  useProps,
  type ActionIconProps,
  type MantineSize,
} from "@mantine/core"
import {
  IconDeviceMobileDown,
  IconRefresh,
  IconWorldCheck,
} from "@tabler/icons-react"
import clsx from "clsx"

import type { MouseEvent } from "react"
import type { SWStatus } from "../../sw/service-worker.js"
import type { PWAStatus } from "../../sw/pwa.js"

import classes from "./sw-buttons.module.scss"

export type SWButtonsProps = {
  swStatus?: SWStatus
  pwaStatus?: PWAStatus
  onUpdate?: () => void
  onInstall?: () => void
  size?: MantineSize
}

const _SWButtons = (props: SWButtonsProps) => {
  const { swStatus, pwaStatus, onUpdate, onInstall, size } = props

  return [
    <SWButtons.Status key="status" status={swStatus} size={size} />,
    <SWButtons.Update
      key="update"
      size={size}
      status={swStatus}
      onClick={(e) => {
        if (onUpdate) {
          e.preventDefault()
          onUpdate()
        }
      }}
    />,
    <SWButtons.Install
      key="install"
      size={size}
      swStatus={swStatus}
      pwaStatus={pwaStatus}
      onClick={(e) => {
        if (onInstall) {
          e.preventDefault()
          onInstall()
        }
      }}
    />,
  ]
}

export type SWStatusProps = ActionIconProps & {
  status?: SWStatus
}

export const SWStatusIndicator = (props: SWStatusProps) => {
  const { className, status, ...other } = useProps(
    "SWStatus",
    { status: "unavailable" } as const,
    props,
  )

  if (status == "ready" || status == "update-available") {
    return (
      <ActionIcon
        disabled
        title="Offline ready"
        radius="xl"
        variant="subtle"
        className={clsx(
          "SWButtons-statusRoot",
          "SWButtons-statusReady",
          classes.statusRoot,
          classes.statusReady,
          className,
        )}
        {...other}
      >
        <IconWorldCheck size="calc(var(--ai-size)*0.8)" />
      </ActionIcon>
    )
  } else if (status == "installing") {
    return (
      <ActionIcon
        title="Preparing offline features"
        radius="xl"
        variant="subtle"
        className={clsx(
          "SWButtons-statusRoot",
          "SWButtons-statusInstalling",
          classes.statusRoot,
          classes.statusInstalling,
          className,
        )}
        loading
        {...other}
      >
        <IconWorldCheck size="calc(var(--ai-size)*0.8)" />
      </ActionIcon>
    )
  }
}

export type SWUpdateButtonProps = ActionIconProps & {
  status?: SWStatus
  onClick?: (e: MouseEvent) => void
}

export const SWUpdateButton = (props: SWUpdateButtonProps) => {
  const { className, status, ...other } = useProps(
    "SWUpdateButton",
    { status: "unavailable" } as const,
    props,
  )
  if (status == "update-available") {
    return (
      <ActionIcon
        title="Update now"
        radius="xl"
        variant="filled"
        className={clsx("SWButtons-update", classes.update, className)}
        {...other}
      >
        <IconRefresh size="calc(var(--ai-size)*0.8)" />
      </ActionIcon>
    )
  }
}

export type SWInstallButtonProps = ActionIconProps & {
  swStatus?: SWStatus
  pwaStatus?: PWAStatus
  onClick?: (e: MouseEvent) => void
}

export const SWInstallButton = (props: SWInstallButtonProps) => {
  const { className, swStatus, pwaStatus, ...other } = useProps(
    "SWInstallButton",
    { swStatus: "unavailable", pwaStatus: "unavailable" } as const,
    props,
  )

  if (swStatus != "ready") {
    return
  }

  if (pwaStatus == "available") {
    return (
      <ActionIcon
        title="Install to device"
        radius="xl"
        variant="filled"
        className={clsx(
          "SWButtons-install",
          "SWButtons-installAvailable",
          classes.install,
          classes.installAvailable,
          className,
        )}
        {...other}
      >
        <IconDeviceMobileDown size="calc(var(--ai-size)*0.8)" />
      </ActionIcon>
    )
  } else if (pwaStatus == "prompted") {
    return (
      <ActionIcon
        title="Installing"
        radius="xl"
        variant="filled"
        className={clsx(
          "SWButtons-install",
          "SWButtons-installInstalling",
          classes.install,
          classes.installInstalling,
          className,
        )}
        loading
        {...other}
      >
        <IconDeviceMobileDown size="calc(var(--ai-size)*0.8)" />
      </ActionIcon>
    )
  }
}

export const SWButtons = Object.assign(_SWButtons, {
  Status: SWStatusIndicator,
  Update: SWUpdateButton,
  Install: SWInstallButton,
})
