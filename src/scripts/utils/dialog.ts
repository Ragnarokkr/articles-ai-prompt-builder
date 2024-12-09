import { type Nullable } from "./utils.ts";

type TargetElement = Nullable<string | HTMLDialogElement>;
type InputElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

/**
 * Given a map of selectors and their corresponding relative values, it populates
 * the input elements inside the target dialog.
 * @param target the dialog element to populate.
 * @param fieldsMap a map of values to assign to the selectors in the dialog.
 */
function populate(target: TargetElement, fieldsMap: Map<string, string>): void {
  if (typeof target === "string") target = document.querySelector<HTMLDialogElement>(target);
  if (!(target instanceof HTMLDialogElement)) return;

  for (const [field, value] of fieldsMap) {
    const el = target.querySelector<InputElement>(field);
    if (el) el.value = value;
  }
}

/**
 * Shows a dialog with modal.
 * @param target the dialog to show
 */
function open(target: TargetElement): void {
  if (!target) return;
  if (target instanceof HTMLDialogElement) target.showModal();
  else document.querySelector<HTMLDialogElement>(target)?.showModal();
}

/**
 * Closes the `target` HTMLDialogElement or search in DOM tree for
 * the closest dialog and does close it.
 * @param target the dialog selector, the dom element itself, or an element within the dialog.
 */
function close(target: HTMLElement | TargetElement): void {
  if (!target) return;

  if (typeof target === "string") {
    const el = document.querySelector<HTMLElement>(target);
    if (!el) return;
    else target = el.closest("dialog");
  }

  if (target && target instanceof HTMLDialogElement) {
    target.close();
    return;
  }

  if (target) target.closest("dialog")?.close();
}

export default {
  populate,
  open,
  close,
};
