import { CustomEvents as PanelsEvents } from "../panels.ts";
import Context from "../../../utils/context.ts";
import { checkVisibility } from "../../../utils/utils.ts";
import Database from "../../../utils/database.ts";
import { DatabaseModel } from "../../../model.ts";
import { type OptionDescriptor, type OptionModel } from "../../../options/options.ts";

const CustomEvents = {
  OPTION_CHECK: "context:options:check",
};

function populateOptions() {
  const options = Context.get("app.options") as OptionDescriptor[];
  const db = Context.get("app.db") as Database<DatabaseModel>;
  const userOptions = db.query("options") as OptionModel;
  const area = document.querySelector<HTMLDivElement>("#options-area");
  const frag = document.createDocumentFragment();
  for (const option of options) {
    const div = document.createElement("div");
    div.classList.add("ui-input");
    const input = document.createElement("input");
    input.setAttribute("id", option.id);
    input.setAttribute("name", option.id);
    input.setAttribute("type", "checkbox");
    input.dataset.change = CustomEvents.OPTION_CHECK;
    input.dataset.params = `{'context':'options.${option.id}'}`;
    input.checked = userOptions[option.id];
    const label = document.createElement("label");
    label.setAttribute("for", option.id);
    label.innerHTML = option.name;
    div.appendChild(input);
    div.appendChild(label);
    frag.appendChild(div);
  }
  area?.replaceChildren(frag);
}

const eventsMap = new Map([
  [PanelsEvents.PANELS_OPEN, (e: Event) => {
    const { target } = (e as CustomEvent).detail;
    if (checkVisibility(target, "panel-options")) populateOptions();
  }],
  [CustomEvents.OPTION_CHECK, (e: Event) => {
    const status = (e.target as HTMLInputElement).checked;
    const { context } = (e as CustomEvent).detail;
    const db = Context.get("app.db") as Database<DatabaseModel>;
    Context.set(context, status);
    db.update("options", Context.get("options") as OptionModel);
  }],
]);

const onReadyList = new Set([
  () => {
    const db = Context.get("app.db") as Database<DatabaseModel>;
    const options = db.query("options") as OptionModel;
    Context.create("options", options);
  },
]);

export { CustomEvents };
export default {
  eventsMap,
  onReadyList,
};
