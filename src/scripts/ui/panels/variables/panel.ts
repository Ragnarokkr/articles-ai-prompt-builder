import Context from "../../../utils/context.ts";
import { dispatch } from "../../../utils/events.ts";
import { CustomEvents as PanelEvents } from "../panels.ts";
import Dialog from "../../../utils/dialog.ts";
import Model, { type VariableDescriptor } from "./model.ts";
import Database from "../../../utils/database.ts";
import { DatabaseModel } from "../../../model.ts";
import { checkVisibility } from "../../../utils/utils.ts";

const CustomEvents = {
  PANEL_ADD_VARIABLE: "panel:variables:add",
  PANEL_EDIT_VARIABLE: "panel:variables:edit",
  PANEL_DELETE_VARIABLE: "panel:variables:delete",
  PANEL_REFRESH: "panel:variables:refresh",
  DIALOG_OK: "dialog:variables:ok",
  DIALOG_CONFIRM: "dialog:variables:confirm",
  DIALOG_CLOSE: "dialog:variables:close",
  DIALOG_REJECT: "dialog:variables:reject",
  VARIABLES_CHANGE: "context:variables:change",
} as const;

const InternalStates = {
  IDLE: "idle",
  ADDING: "adding",
  EDITING: "editing",
  DELETING: "deleting",
} as const;

function renderTableRow(data: VariableDescriptor): string {
  return /*html*/ `
  <span class="ui-table-cell">${data.name}</span>
  <span class="ui-table-cell">${data.type}</span>
  <span class="ui-table-cell">
    <button class="ui-button has-icon medium is-flat info" 
      title="Edit Variable" 
      data-click="${CustomEvents.PANEL_EDIT_VARIABLE}" 
      data-params="{ 'target': '#dialog-variables', 'id': '${data.id}' }"
    />
      ${Context.get("variables.iconEdit")}
    </button>
    <button class="ui-button has-icon medium is-flat danger" 
      title="Delete Variable" 
      data-click="${CustomEvents.PANEL_DELETE_VARIABLE}" 
      data-params="{ 'target': '#dialog-confirm-variables', 'id': '${data.id}' }"
    />
      ${Context.get("variables.iconDelete")}
    </button>
  </span>`;
}

function refreshTable(target: HTMLElement | null) {
  const db = Context.get("app.db") as Database<DatabaseModel>;
  const vars = db.query("variables");
  dispatch(target, CustomEvents.PANEL_REFRESH, {
    target: "#table-variables",
    data: vars,
  });
}

const eventsMap = new Map([
  [PanelEvents.PANELS_OPEN, (e: Event) => {
    const { target } = (e as CustomEvent).detail;
    if (checkVisibility(target, "panel-variables")) refreshTable(document.querySelector("#table-variables"));
  }],
  [CustomEvents.PANEL_ADD_VARIABLE, (e: Event) => {
    const { target } = (e as CustomEvent).detail;
    if (target) {
      Context.set("variables.state", InternalStates.ADDING);
      Dialog.populate(
        target,
        new Map([
          ["#variable-id", ""],
          ["#variable-name", ""],
          ["#variable-type", "single"],
          ["#variable-data", ""],
        ]),
      );
      Dialog.open(target);
    }
  }],
  [CustomEvents.PANEL_EDIT_VARIABLE, (e: Event) => {
    const { target, id } = (e as CustomEvent).detail;
    if (target) {
      const db = Context.get("app.db") as Database<DatabaseModel>;
      const item = (db.query("variables") as VariableDescriptor[]).find((
        i: VariableDescriptor,
      ) => i.id === id);
      Context.set("variables.state", InternalStates.EDITING);
      Context.set("variables.varId", item!.id);
      Context.set("variables.varName", item!.name);
      Context.set("variables.varType", item!.type);
      Context.set("variables.varData", item!.data.join("\n"));
      Dialog.populate(
        target,
        new Map([
          ["#variable-id", item!.id],
          ["#variable-name", item!.name],
          ["#variable-type", item!.type],
          ["#variable-data", item!.data.join("\n")],
        ]),
      );
      Dialog.open(target);
    }
  }],
  [CustomEvents.PANEL_DELETE_VARIABLE, (e: Event) => {
    const { target, id } = (e as CustomEvent).detail;
    if (target) {
      Context.set("variables.state", InternalStates.DELETING);
      Context.set("variables.varId", id);
      Dialog.open(target);
    }
  }],
  [CustomEvents.DIALOG_OK, (e: Event) => {
    const state = Context.get("variables.state");
    switch (state) {
      case InternalStates.ADDING:
        {
          Model.add({
            id: crypto.randomUUID(),
            name: (Context.get("variables.varName") as string) ?? "",
            type: (Context.get("variables.varType") as string) ?? "",
            data: (Context.get("variables.varData") as string).split("\n").filter((i) => i.length > 0).sort(),
          });
          refreshTable(e.target as HTMLElement);
        }
        break;
      case InternalStates.EDITING:
        {
          Model.update({
            id: Context.get("variables.varId") as string,
            name: Context.get("variables.varName") as string,
            type: Context.get("variables.varType") as string,
            data: (Context.get("variables.varData") as string).split("\n").filter((i) => i.length > 0).sort(),
          });
          refreshTable(e.target as HTMLElement);
        }
        break;
    }
    (e.target as HTMLElement).closest("dialog")?.close();
    Context.set("variables.state", InternalStates.IDLE);
  }],
  [CustomEvents.DIALOG_CONFIRM, (e: Event) => {
    if (Context.get("variables.state") === InternalStates.DELETING) {
      const db = Context.get("app.db") as Database<DatabaseModel>;
      const vars = (db.query("variables") as VariableDescriptor[]).filter((i: VariableDescriptor) =>
        i.id !== Context.get("variables.varId")
      );
      db.update("variables", vars);
      refreshTable(e.target as HTMLElement);
    }
    Dialog.close(e.target as HTMLElement);
    Context.set("variables.state", InternalStates.IDLE);
  }],
  [CustomEvents.DIALOG_CLOSE, (e: Event) => {
    Dialog.close(e.target as HTMLElement);
    Context.set("variables.state", InternalStates.IDLE);
  }],
  [CustomEvents.DIALOG_REJECT, (e: Event) => {
    Dialog.close(e.target as HTMLElement);
    Context.set("variables.state", InternalStates.IDLE);
  }],
  [CustomEvents.VARIABLES_CHANGE, (e: Event) => {
    const { context, value } = (e as CustomEvent).detail;
    Context.set(context, value);
  }],
  [CustomEvents.PANEL_REFRESH, (e: Event) => {
    const table = document.querySelector<HTMLTableElement>(`${(e as CustomEvent).detail.target} .ui-table-body`);
    const variables = (e as CustomEvent).detail.data as VariableDescriptor[];
    const frag = document.createDocumentFragment();
    for (const variable of variables) {
      const row = document.createElement("div");
      row.classList.add("ui-table-row");
      row.innerHTML = renderTableRow(variable);
      frag.appendChild(row);
    }
    table?.replaceChildren(frag);
  }],
]);

const onReadyList = new Set([
  async () => {
    Context.create("variables");
    Context.set(
      "variables.iconEdit",
      await (await fetch("static/img/icons/material-200/edit-outlined.svg")).text(),
    );
    Context.set(
      "variables.iconDelete",
      await (await fetch("static/img/icons/material-200/variable_remove-outlined.svg")).text(),
    );
    Context.set("variables.state", InternalStates.IDLE);
    Context.set("variables.varId", "");
    Context.set("variables.varName", "");
    Context.set("variables.varType", "single");
    Context.set("variables.varData", "");
  },
]);

export { CustomEvents };

export default {
  eventsMap,
  onReadyList,
};
