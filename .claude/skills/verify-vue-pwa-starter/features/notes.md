# Notes

A user writes a titled note in a dialog, edits it later, pins it to the top of the list, and finds it again after a reload because it is saved on the device.

## Sub-features

- `notes-create` saves a new note from the `New note` dialog.
- `notes-validate` rejects an empty title, marks `Title` invalid and explains why.
- `notes-edit` changes the title and body of an existing note.
- `notes-pin` moves a note into the `Pinned` group and back.
- `notes-persist` keeps saved notes across reloads.
- `notes-discard` asks before closing a dialog with unsaved changes.

## How to get to it (user POV)

- Choose `New note` in the page heading.
- In an empty notebook, choose `Write your first note`.
- Choose a note card (button `Edit <title>`) to edit it.
- Inside the dialog, press `Control+Enter` to save.
- Choose `Pin <title>` / `Unpin <title>` on a card.

## Driving it with control.ts

Preconditions:

- `$C doctor` reports `healthy: true`.
- `$C seed basic` reports `active: 2`.

- **Open editor.** Choose `New note`. Run `$C click --role button --name "New note"`. A `dialog "New note"` appears with `textbox "Title"` and `textbox "Note"`.
- **Reject empty title.** Save without a title. Run `$C click --role button --name "Save note"`. `snapshot` shows `textbox "Title" [invalid]` and the text `Give your note a title.`; the dialog stays open.
- **Save.** Enter content and save. Run `$C fill --role textbox --name Title --value "Release checklist"`, `$C fill --role textbox --name Note --value "Tag and publish"`, `$C click --role button --name "Save note"`, `$C wait --role dialog --name "New note" --state hidden`. A `heading "Release checklist"` appears.
- **Keyboard save.** Open a new note, fill both fields, then run `$C press --key Control+Enter`. The dialog closes and the note appears.
- **Edit.** Run `$C click --role button --name "Edit Release checklist"`. A `dialog "Edit note"` appears. Fill new values and choose `Save note`. The card shows the new title.
- **Pin.** Run `$C click --role button --name "Pin Grocery list"`. A `heading "Pinned 1"` group appears with `Grocery list` and a `Pinned` badge. `Unpin Grocery list` reverses it.
- **Discard guard.** Open a new note, fill `Title`, run `$C press --key Escape`. The dialog stays open and `$C console` shows `dialog:confirm` answered `dismiss`. Run `$C dialogs accept` and press `Escape` again. The dialog closes. Run `$C dialogs dismiss` afterwards.
- **Persist.** Run `$C reload` and `$C wait --role heading --name "Release checklist"`. Then `$C notes` shows the note with its body.
- **Proof.** Run `$C snapshot --save --label notes` and `$C screenshot --label notes`.

## Gotchas

- `New note` is both a button name and a dialog name. Always pass `--role`.
- A save that shows the card is not persistence proof. Reload, and read `notes`.
- Saved timestamps use the real clock. Seeded notes show Jan 5, new notes show today.
- The unsaved-changes prompt is a native `window.confirm`, not an ARIA dialog. It never shows in `snapshot`. `dialogs` decides the answer (default `dismiss`), and `console` records it.
