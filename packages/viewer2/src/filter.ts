import { atom, type Atom, type PrimitiveAtom, type WritableAtom } from "jotai"
import { createContext } from "react"

export type FilterStateAtom = Atom<
  Readonly<{
    text: PrimitiveAtom<string>
    disabledTags: WritableAtom<
      ReadonlySet<string>,
      [Iterable<string> | ((prev: ReadonlySet<string>) => Iterable<string>)],
      void
    >
  }>
>

export const makeFilterStateAtom = (): FilterStateAtom => {
  const baseDisabledTags = atom(new Set<string>())

  return atom({
    text: atom(""),
    disabledTags: atom(
      (get) => get(baseDisabledTags),
      (
        get,
        set,
        update:
          | Iterable<string>
          | ((prev: ReadonlySet<string>) => Iterable<string>),
      ) => {
        let newVal
        if (typeof update == "function") {
          newVal = update(get(baseDisabledTags))
        } else {
          newVal = update
        }

        newVal = newVal instanceof Set ? newVal : new Set(newVal)

        set(baseDisabledTags, newVal)
      },
    ),
  })
}

export const FilterStateAtomContext = createContext(makeFilterStateAtom())
