// Release builds carry a full commit hash. Show the short form.
export function appVersion() {
  return /^[a-f0-9]{40}$/.test(__APP_VERSION__)
    ? __APP_VERSION__.slice(0, 7)
    : __APP_VERSION__
}
