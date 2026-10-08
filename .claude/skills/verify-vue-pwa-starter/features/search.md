# Search

A user types into the search box to narrow the visible notes by title or body. With no matches they see an empty state that offers to clear the search.

## Sub-features

- `search-match` narrows the list to notes whose title or body matches.
- `search-empty` shows `No thoughts found.` for a query with no matches.
- `search-clear` restores the full list from the empty state.
- `search-persist` keeps the query across a Settings round trip.

## How to get to it (user POV)

- Type into `searchbox "Search notes"` on the Notes view.
- Choose `Clear search` in the empty state.

## Driving it with control.ts

Preconditions:

- `$C doctor` reports `healthy: true`.
- `$C seed basic` reports `active: 2`.

- **Title match.** Run `$C fill --role searchbox --name "Search notes" --value quarterly`. `$C snapshot` shows `heading "Quarterly plan"` and no `heading "Grocery list"`.
- **Body match.** Run `$C fill --role searchbox --name "Search notes" --value lemons`. Only `Grocery list` remains.
- **Empty state.** Run `$C fill --role searchbox --name "Search notes" --value volcano` and `$C wait --text "No thoughts found."`.
- **Clear.** Run `$C click --role button --name "Clear search"`. Both seeded headings return and the searchbox is empty.
- **Settings round trip.** Search `quarterly`, run `$C click --role button --name Settings`, then `$C click --role button --name Notes`. The query and filtered list remain.
- **Proof.** Run `$C snapshot --save --label search` and `$C screenshot --label search` with the query visible.

## Gotchas

- The search filter also applies inside the Trash view. Clear it before driving Trash, or the `Restore <title>` buttons will not appear.
- `Clear search` exists only in the empty state. With matches visible, clear by filling `--value ""`.
- `seed many` titles contain `Note 0001`…, and bodies contain `seed-<n>`. Use these for unambiguous queries.
