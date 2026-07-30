import { retiredInstaller } from "./install.js";

export function onRequest() {
  return retiredInstaller();
}
