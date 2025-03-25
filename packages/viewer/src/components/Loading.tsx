import { Flex, Loader } from "@mantine/core"

export const Loading = () => {
  return (
    <Flex mih={500} justify="center" align="center">
      <Loader type="dots" />
    </Flex>
  )
}
