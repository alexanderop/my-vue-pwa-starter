# Trash

Deleting a note moves it to Trash after a confirmation. The user can undo right away, restore it later from the Trash view, or delete it permanently from there.

## Sub-features

- `trash-delete` moves a note to Trash after the `Move this note to Trash?` confirmation.
- `trash-undo` restores the note from the toast right after deletion.
- `trash-view` lists trashed notes behind the `Trash (<n>)` toggle.
- `trash-restore` returns a trashed note to the list.
- `trash-purge` permanently deletes a trashed note after a second confirmation.

## How to get to it (user POV)

- Choose `Delete <title>` on a note card.
- Choose `Undo` in the toast that follows.
- Choose `Trash (<n>)` in the toolbar. `Back to notes` returns.

## Driving it with control.ts

Preconditions:

- `$C doctor` reports `healthy: true`.
- `$C seed trash-and-pinned` reports `active: 4, pinned: 2, trashed: 2`.

- **Delete.** Run `$C click --role button --name "Delete Grocery list"`. A `dialog "Move this note to Trash?"` shows `Grocery list`. Run `$C click --role button --name "Delete note"`. A status reads `Note moved to Trash.`
- **Undo.** Run `$C click --role button --name Undo`. `Grocery list` is back in the list. `$C notes` shows it without `deletedAt`.
- **Trash view.** Delete it again, then run `$C click --role button --name "Trash (3)"`. Three cards appear with disabled `Edit …` buttons and `Restore <title>` buttons.
- **Restore.** Run `$C click --role button --name "Restore Grocery list"`. After `Back to notes`, `Grocery list` is in the list and the toggle reads `Trash (2)`.
- **Purge.** In the Trash view, run `$C click --role button --name "Delete Old idea"`, then `$C click --role button --name "Permanently delete"`. `$C notes` no longer contains `Old idea`.
- **Proof.** Run `$C reload`, reopen `Trash (<n>)`, and capture `$C snapshot --save --label trash` and `$C screenshot --label trash`.

## Gotchas

- The toggle's name includes the count (`Trash (2)`). Read the count from `snapshot` first.
- An active search filters the Trash view too.
- The `Undo` button disappears with the toast. Use it immediately after deleting.
