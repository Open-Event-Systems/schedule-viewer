import { useScheduleData } from "#src/hooks/schedule.js"
import { ItemCard } from "@open-event-systems/schedule-react"
import { getRouteApi, notFound } from "@tanstack/react-router"
import { useMemo } from "react"

const routeApi = getRouteApi(
  "/loading/mainLayout/itemDetails/$itemType/$itemId",
)

export const ItemDetailsRoute = () => {
  const { itemId } = routeApi.useParams()

  const data = useScheduleData()
  const item = useMemo(() => data.getById(itemId), [data, itemId])
  if (!item) {
    throw notFound()
  }

  let contacts

  if ("contacts" in item.item) {
    contacts = item.item.contacts
  }

  return (
    <ItemCard
      name={item.item.name}
      description={item.item.description}
      occurrences={item.occurrences}
      tags={item.item.tags}
      contacts={contacts}
      size="md"
    />
  )
}
