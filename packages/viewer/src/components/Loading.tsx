import { Flex, Loader } from "@mantine/core"

export const Loading = () => {
  return (
    <Flex className="Loading-root" justify="center" align="center">
      <Loader className="Loading-loader" type="dots" />
    </Flex>
  )
}
