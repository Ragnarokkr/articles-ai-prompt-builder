import { CustomEvents as PanelsEvents } from "../panels.ts";
import { ContextParserResult, CustomEvents as ContextEvents } from "../../../utils/context.ts";
import { type ChipDescriptor, type TagDescriptor } from "./model.ts";
import { type VariableDescriptor } from "../../../panels/../ui/panels/variables/model.ts";
import { replaceFn } from "./defaultTags.ts";

import Context from "../../../utils/context.ts";
import { EventHandler } from "../../../utils/events.ts";
import Dialog from "../../../utils/dialog.ts";
import { checkVisibility } from "../../../utils/utils.ts";
import Database from "../../../utils/database.ts";
import { DatabaseModel } from "../../../model.ts";

type ChipShiftDirections = "left" | "right";

const CustomClasses = {
  IS_EXCEEDING: "is-exceeding",
  IS_COPIED: "is-copied",
} as const;

const CustomEvents = {
  PANEL_ADD_CHIP: "panel:inputs:add-chip",
  PANEL_MOVE_CHIP_LEFT: "panel:inputs:move-chip-left",
  PANEL_MOVE_CHIP_RIGHT: "panel:inputs:move-chip-right",
  PANEL_REMOVE_CHIP: "panel:inputs:remove-chip",
  PANEL_SETUP_TAG: "panel:inputs:setup-tag",
  PANEL_RESET_CHIPS: "panel:inputs:reset-chips",
  PANEL_BUILD_PROMPT: "panel:inputs:build-prompt",
  DIALOG_TAG_OK: "dialog:inputs:tag-ok",
  DIALOG_TAG_CLOSE: "dialog:inputs:tag-close",
  DIALOG_COPY_PROMPT: "dialog:inputs:copy-prompt",
  DIALOG_CLOSE_PROMPT: "dialog:inputs:close-prompt",
  CHIP_CHANGE: "context:inputs:change-chip",
} as const;

function renderTextChipPlaceholder() {
  const div = document.createElement("div");
  div.classList.add("ui-text-chip-placeholder");
  div.dataset.click = CustomEvents.PANEL_ADD_CHIP;
  div.innerHTML = /*html*/ `
    <div class="row">Add</div>
    <div class="row">${Context.get("inputs.iconAdd")}</div>
    <div class="row">New Text Chip</div>`;
  return div;
}

function renderTextChip(chip: ChipDescriptor, index: number) {
  const renderArrowButton = (direction: ChipShiftDirections) => /*html*/ `
  <button class="ui-button is-flat has-icon medium" 
    data-click="panel:inputs:move-chip-${direction}" 
    data-params="{'key':'${index}'}">
    ${direction === "left" ? Context.get("inputs.iconLeft") : Context.get("inputs.iconRight")}
  </button>`;

  const div = document.createElement("div");
  div.classList.add("ui-text-chip");
  div.dataset.id = chip.id;
  div.innerHTML = /*html*/ `
    <div class="ui-text-chip-title-bar"> 
      ${renderArrowButton("left")}     
      <button class="ui-button is-flat has-icon medium" 
        data-click="${CustomEvents.PANEL_REMOVE_CHIP}" 
        data-params="{'id':'${chip.id}'}">
        ${Context.get("inputs.iconClose")}
      </button>
      ${renderArrowButton("right")}
    </div>
    <div class="ui-text-chip-content">
      <textarea
        name="text-chip"
        data-change="${CustomEvents.CHIP_CHANGE}" 
        data-params="{'context':'inputs.chips[id:${chip.id}].content'}"
        >${chip.content}</textarea>
    </div>`;
  return div;
}

function renderChips() {
  const frag = document.createDocumentFragment();
  (Context.get("inputs.chips") as ChipDescriptor[]).forEach((chip, index) => {
    frag.appendChild(renderTextChip(chip, index));
  });
  frag.appendChild(renderTextChipPlaceholder());
  document.querySelector("#text-chips-area")?.replaceChildren(frag);
}

function swapChips<T>(index1: number, index2: number): void {
  const length = (Context.get("inputs.chips") as ChipDescriptor[]).length;

  if (index1 < 0 || index1 >= length || index2 < 0 || index2 >= length) {
    throw new Error("Index out of bounds");
  }

  const temp = Context.get(`inputs.chips[${index1}]`);
  Context.set(`inputs.chips[${index1}]`, Context.get(`inputs.chips[${index2}]`));
  Context.set(`inputs.chips[${index2}]`, temp);
}

function renderTag(tag: TagDescriptor) {
  const button = document.createElement("button");
  button.classList.add("ui-button", "has-label", "info");
  button.dataset.click = CustomEvents.PANEL_SETUP_TAG;
  button.dataset.params = `{'target':'#dialog-tag-setup', 'id':'${tag.id}'}`;
  button.innerHTML = `<span class="ui-button-label">${tag.name}</span>`;
  return button;
}

function renderTags() {
  const tagsArea = document.querySelector<HTMLElement>("#tags-area");
  if (tagsArea) {
    const frag = document.createDocumentFragment();
    for (const tag of (Context.get("inputs.tags") as TagDescriptor[])) {
      frag.appendChild(renderTag(tag));
    }
    tagsArea.replaceChildren(frag);
  }
}

function populateSetupDialog(target: string, id: string) {
  const db = Context.get("app.db") as Database<DatabaseModel>;
  const variable = (db.query("variables") as VariableDescriptor[]).find((i) => i.id === id);
  const dialog = document.querySelector(`${target} .ui-dialog-content`);

  if (dialog) {
    let html = /*html*/ `<fieldset data-type="${variable!.type}"><legend>Select ${
      variable!.type === "single" ? "one option" : "one or more options"
    }:</legend>`;
    if (variable!.type === "single") {
      for (const option of variable!.data) {
        const key = crypto.randomUUID();
        html += /*html*/ `
        <div class="ui-input">
          <label for="${key}">
            <input type="radio" id="${key}" name="${variable!.id}" value="${option}" />
            <span class="ui-input-label">${option}</span>
          </label>
        </div>
        `;
      }
    } else if (variable!.type === "multiple") {
      for (const option of variable!.data) {
        const key = crypto.randomUUID();
        html += /*html*/ `
        <div class="ui-input">
          <label for="${key}">
            <input type="checkbox" id="${key}" name="${variable!.id}" value="${option}" />
            <span class="ui-input-label">${option}</span>
          </label>
        </div>
        `;
      }
    }
    html += /*html*/ `</fieldset>`;
    dialog.innerHTML = html;
  }
}

function buildPrompt(): string {
  const db = Context.get("app.db") as Database<DatabaseModel>;
  const bodyText = (db.query("systemPrompt") as string).replace(/\{\{\w+(\:.+)?\}\}/g, replaceFn);
  Context.set("inputs.bodyText", bodyText);
  return bodyText;
}
function populatePromptDialog(target: string, prompt: string) {
  const textarea = document.querySelector<HTMLTextAreaElement>(`${target} #prompt-body-text`);
  if (textarea) {
    textarea.value = prompt;
    if (prompt.length >= 16000) {
      textarea.closest("dialog")?.classList.add(CustomClasses.IS_EXCEEDING);
    } else textarea.closest("dialog")?.classList.remove(CustomClasses.IS_EXCEEDING);
  }
}

const eventsMap = new Map<string, EventHandler>([
  [PanelsEvents.PANELS_OPEN, (e: Event) => {
    const { target } = (e as CustomEvent).detail;
    if (checkVisibility(target, "panel-inputs")) {
      const db = Context.get("app.db") as Database<DatabaseModel>;
      const variables = db.query("variables") as VariableDescriptor[];
      Context.set(
        "inputs.tags",
        variables.map((item: VariableDescriptor) => ({ id: item.id, name: item.name, setup: [] })),
      );
      renderTags();

      // renders placeholder chip
      const chipsArea = document.querySelector<HTMLElement>("#text-chips-area");
      if (chipsArea && chipsArea.innerHTML === "") {
        chipsArea.appendChild(renderTextChipPlaceholder());
      }
    }
  }],
  [CustomEvents.PANEL_ADD_CHIP, () => {
    Context.set("inputs.scroll", true);
    Context.set("inputs.chips", [...Context.get("inputs.chips") as Array<ChipDescriptor>, {
      id: crypto.randomUUID(),
      content: "",
    }]);
  }],
  [CustomEvents.PANEL_REMOVE_CHIP, (e: Event) => {
    const { id } = (e as CustomEvent).detail;
    Context.set("inputs.scroll", false);
    Context.set(
      "inputs.chips",
      (Context.get("inputs.chips") as Array<ChipDescriptor>).filter((chip) => chip.id !== id),
    );
  }],

  [CustomEvents.PANEL_MOVE_CHIP_LEFT, (e: Event) => {
    const { key } = (e as CustomEvent).detail;
    if (parseInt(key) === 0) return;
    Context.set("inputs.scroll", false);
    swapChips(parseInt(key), parseInt(key) - 1);
  }],
  [CustomEvents.PANEL_MOVE_CHIP_RIGHT, (e: Event) => {
    const { key } = (e as CustomEvent).detail;
    const len = (Context.get("inputs.chips") as Array<ChipDescriptor>).length;
    if (parseInt(key) === (len - 1)) return;
    Context.set("inputs.scroll", false);
    swapChips(parseInt(key), parseInt(key) + 1);
  }],
  [CustomEvents.PANEL_SETUP_TAG, (e: Event) => {
    const { id, target } = (e as CustomEvent).detail;
    populateSetupDialog(target, id);
    Dialog.open(target);
  }],
  [CustomEvents.PANEL_RESET_CHIPS, () => {
    Context.set("inputs.chips", []);
    (Context.get("inputs.tags") as TagDescriptor[]).forEach((i) => i.setup.length = 0);
  }],
  [CustomEvents.PANEL_BUILD_PROMPT, (e: Event) => {
    const { target } = (e as CustomEvent).detail;
    populatePromptDialog(target, buildPrompt());
    Dialog.open(target);
  }],
  [CustomEvents.DIALOG_TAG_OK, (e: Event) => {
    const target = (e.target as HTMLElement).closest("dialog");
    if (target) {
      const type = target.querySelector<HTMLFieldSetElement>("fieldset")?.dataset.type;
      if (type === "single") {
        const choice = target.querySelector('[type="radio"]:checked');
        if (choice) {
          Context.set(`inputs.tags[id:${choice?.getAttribute("name")}].setup`, [(choice as HTMLInputElement)!.value]);
          Dialog.close(target);
        }
      } else if (type === "multiple") {
        const choice = target.querySelectorAll('[type="checkbox"]:checked');
        if (choice) {
          Context.set(
            `inputs.tags[id:${choice[0]?.getAttribute("name")}].setup`,
            Array.from(choice).map((el) => (el as HTMLInputElement).value),
          );
          Dialog.close(target);
        }
      }
    }
  }],
  [CustomEvents.DIALOG_TAG_CLOSE, (e: Event) => {
    Dialog.close(e.target as HTMLElement);
  }],

  [CustomEvents.DIALOG_COPY_PROMPT, async (e: Event) => {
    if (navigator.clipboard) {
      const { target } = (e as CustomEvent).detail;
      try {
        await navigator.clipboard.writeText(Context.get("inputs.bodyText") as string);
        document.querySelector<HTMLDialogElement>(target)?.classList.add(CustomClasses.IS_COPIED);
        setTimeout(() => {
          document.querySelector<HTMLDialogElement>(target)?.classList.remove(CustomClasses.IS_COPIED);
        }, 5000);
      } catch (err) {
        console.error(err);
      }
    }
    Dialog.close;
  }],
  [CustomEvents.DIALOG_CLOSE_PROMPT, (e: Event) => {
    Dialog.close(e.target as HTMLElement);
  }],
  [CustomEvents.CHIP_CHANGE, (e: Event) => {
    const { context, value } = (e as CustomEvent).detail;
    Context.set(context, value);
  }],
  [ContextEvents.CONTEXT_CHANGE, (e: Event) => {
    const { context, propertyKey, searchKey } = (e as CustomEvent).detail as ContextParserResult;
    if (context === "inputs" && propertyKey === "chips" && !searchKey) {
      if ((Context.get("inputs.chips") as ChipDescriptor[]).length > 0) {
        document.querySelector<HTMLButtonElement>("#btn-build-prompt")?.removeAttribute("disabled");
        document.querySelector<HTMLButtonElement>("#btn-reset-chips")?.removeAttribute("disabled");
      } else {
        document.querySelector<HTMLButtonElement>("#btn-build-prompt")?.setAttribute("disabled", "");
        document.querySelector<HTMLButtonElement>("#btn-reset-chips")?.setAttribute("disabled", "");
      }
      renderChips();
      if (Context.get("inputs.scroll")) {
        document.querySelector<HTMLElement>(".ui-text-chip-placeholder")?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
        Context.set("inputs.scroll", false);
      }
    }
  }],
]);

const onReadyList = new Set([
  async () => {
    Context.create("inputs");
    Context.set(
      "inputs.iconAdd",
      await (await fetch("static/img/icons/material-200/add_box-outlined.svg")).text(),
    );
    Context.set(
      "inputs.iconClose",
      await (await fetch("static/img/icons/material-200/close-outlined.svg")).text(),
    );
    Context.set(
      "inputs.iconLeft",
      await (await fetch("static/img/icons/material-200/chevron_left-outlined.svg")).text(),
    );
    Context.set(
      "inputs.iconRight",
      await (await fetch("static/img/icons/material-200/chevron_right-outlined.svg")).text(),
    );
    Context.set("inputs.chips", []);
  },
  () => {
    self.addEventListener("beforeunload", (e: Event) => {
      const chips = Context.get("inputs.chips") as ChipDescriptor[];
      if (chips.length > 0) e.preventDefault();
    });
  },
]);

export { CustomClasses, CustomEvents };

export default {
  eventsMap,
  onReadyList,
};
