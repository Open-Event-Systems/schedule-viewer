import {
  makeSelections,
  type SelectionsType,
} from "@open-event-systems/schedule-lib"
import {
  makeObservableSet,
  useSessionSelections,
  useSetSelections,
} from "@open-event-systems/schedule-react"
import { action, makeObservable } from "mobx"
import { createContext, useEffect, useState } from "react"

export const makeSelectionsState = (
  onUpdate?: (selections: Iterable<string>) => void,
  initial?: Iterable<string>,
) => {
  const obs = makeObservable(
    {
      selections: makeObservableSet(initial),
      updateSelections: (id: string, selected: boolean) => {
        if (selected) {
          obs.selections.add(id)
        } else {
          obs.selections.delete(id)
        }

        onUpdate && onUpdate(obs.selections)
      },
      setSelections: (ids: Iterable<string>) => {
        const cur = new Set(obs.selections)
        const updated = new Set(ids)
        const added = updated.difference(cur)
        const removed = cur.difference(updated)

        for (const id of added) {
          obs.selections.add(id)
        }

        for (const id of removed) {
          obs.selections.delete(id)
        }
      },
    },
    {
      updateSelections: action,
      setSelections: action,
    },
  )

  return obs
}

export const useSelectionsState = (type: SelectionsType) => {
  const selections = useSessionSelections(type)
  const update = useSetSelections(type)
  const [state] = useState(() => {
    const onUpdate = (items: Iterable<string>) => {
      update(makeSelections(items, new Date()))
    }
    return makeSelectionsState(onUpdate)
  })

  useEffect(() => {
    state.setSelections(selections.items)
  }, [state, selections])

  return state
}

export const BookmarksStateContext = createContext<
  ReturnType<typeof useSelectionsState>
>(undefined as unknown as ReturnType<typeof useSelectionsState>)
