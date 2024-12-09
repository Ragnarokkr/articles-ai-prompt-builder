import { CustomEvents as PanelsEvents } from "../panels.ts";
import Context from "../../../utils/context.ts";
import { checkVisibility } from "../../../utils/utils.ts";
import Database from "../../../utils/database.ts";
import { DatabaseModel } from "../../../model.ts";

const CustomEvents = {
  OPTION_CHECK: "context:options:check",
};

function populateOptions() {
  const db = Context.get("app.db") as Database<DatabaseModel>;
  const options = db.query("options") as Record<string, boolean>;
  for (const [key, value] of Object.entries(options)) {
    const el = document.querySelector<HTMLInputElement>(`#${key}`);
    if (el) el.checked = value as boolean;
  }
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
    db.update("options", Context.get("options") as Record<string, boolean>);
  }],
]);

const onReadyList = new Set([
  () => {
    const db = Context.get("app.db") as Database<DatabaseModel>;
    const options = db.query("options") as Record<string, boolean>;
    Context.create("options", options);
  },
]);

export { CustomEvents };
export default {
  eventsMap,
  onReadyList,
};
