import { type DatabaseModel, type ServiceData } from "./model.ts";

import * as Events from "./utils/events.ts";
import Context from "./utils/context.ts";
import Database from "./utils/database.ts";
import Options, { type OptionDescriptor } from "./options/options.ts";

import Drawer from "./ui/drawer/drawer.ts";
import Menu from "./ui/menu/menu.ts";
import Panels from "./ui/panels/panels.ts";
import PanelVariables from "./ui/panels/variables/panel.ts";
import PanelSystemPrompt from "./ui/panels/systemPrompt/panel.ts";
import PanelInputs from "./ui/panels/inputs/panel.ts";
import PanelOptions from "./ui/panels/options/panel.ts";
import PanelImportExport from "./ui/panels/importExport/panel.ts";

const services: ServiceData[] = [
  Drawer,
  Menu,
  Panels,
  PanelVariables,
  PanelSystemPrompt,
  PanelInputs,
  PanelOptions,
  PanelImportExport,
] as const;

Events.init("#app");

Context.create("app");

Context.set("app.options", new Set(Options));

Context.set(
  "app.db",
  new Database<DatabaseModel>("articlesAI", {
    variables: [],
    systemPrompt: "",
    options: Object.fromEntries(
      Options.map(
        (o: OptionDescriptor) => [o.id, o.defaultValue],
      ),
    ),
  }),
);

for (const service of services) {
  if (service.eventsMap) {
    Events.register(service.eventsMap);
  }
}

for (const service of services) {
  if (service.onReadyList) {
    for (const fn of service.onReadyList) {
      if (fn instanceof Promise) {
        (async () => {
          await fn();
        })();
      } else fn();
    }
  }
}
