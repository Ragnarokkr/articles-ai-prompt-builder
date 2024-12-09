import Context from "../../../utils/context.ts";
import { CustomEvents as PanelsEvents } from "../panels.ts";
import Database from "../../../utils/database.ts";
import { DatabaseModel } from "../../../model.ts";
import { checkVisibility } from "../../../utils/utils.ts";

const CustomEvents = {
  PROMPT_CHANGE: "context:system-prompt:change",
};

function populateText(target: string) {
  const db = Context.get("app.db") as Database<DatabaseModel>;
  const prompt = db.query("systemPrompt");
  const el = document.querySelector<HTMLTextAreaElement>(target);
  if (!el) return;
  else el.value = prompt as string;
}

const eventsMap = new Map([
  [PanelsEvents.PANELS_OPEN, (e: Event) => {
    const { target } = (e as CustomEvent).detail;
    if (checkVisibility(target, "panel-system-prompt")) populateText("#system-prompt");
    // if ((target as HTMLElement).getAttribute("id") !== "panel-system-prompt") return;
    // if (target.checkVisibility()) populateText("#system-prompt");
  }],
  [CustomEvents.PROMPT_CHANGE, (e: Event) => {
    const prompt = (e.target as HTMLTextAreaElement).value;
    const db = Context.get("app.db") as Database<DatabaseModel>;
    db.update("systemPrompt", prompt);
    Context.set("systemPrompt.value", prompt);
  }],
]);

const onReadyList = new Set([
  () => {
    Context.create("systemPrompt");
    Context.set("systemPrompt.value", "");
  },
]);

export { CustomEvents };

export default {
  eventsMap,
  onReadyList,
};
