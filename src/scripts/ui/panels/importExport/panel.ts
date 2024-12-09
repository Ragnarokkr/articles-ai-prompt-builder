import { DatabaseModel } from "../../../model.ts";
import Context, { CustomEvents as ContextEvents } from "../../../utils/context.ts";
import Database from "../../../utils/database.ts";
import Dialog from "../../../utils/dialog.ts";
import { formatDate } from "../../../utils/utils.ts";

const CustomEvents = {
  PANEL_IMPORT: "panel:import-export:import",
  PANEL_EXPORT: "panel:import-export:export",
  PANEL_ACCEPT: "panel:import-export:accept",
} as const;

const DefaultFileName = "articles-ai-builder";

function downloadJSON(filename: string, json: object) {
  try {
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    // Clean up and remove the link
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error(error);
  }
}

function uploadJSON(file: File) {
  try {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result;
      if (typeof content === "string") {
        Context.set("importExport.data", content);
      }
    };
    reader.readAsText(file);
  } catch (error) {
    console.error(error);
  }
}

function message(msg: string, callback?: () => void) {
  const infoMsg = document.querySelector<HTMLParagraphElement>("#panel-info-message");
  const bakString = infoMsg?.innerHTML;
  if (infoMsg) infoMsg.innerHTML = msg;
  setTimeout(() => {
    if (infoMsg) infoMsg.innerHTML = bakString ?? "";
    if (callback) callback();
  }, 5000);
}

const eventsMap = new Map([
  [CustomEvents.PANEL_IMPORT, () => {
    document.querySelector<HTMLInputElement>("#import-file")?.click();
  }],
  [CustomEvents.PANEL_EXPORT, () => {
    const db = Context.get("app.db") as Database<DatabaseModel>;
    const config = Object.fromEntries([
      ["variables", db.query("variables")],
      ["systemPrompt", db.query("systemPrompt")],
      ["options", db.query("options")],
    ]);
    const filename = `${DefaultFileName}_${formatDate(new Date())}.json`;
    downloadJSON(filename, config);
  }],
  [CustomEvents.PANEL_ACCEPT, () => {
    try {
      const { variables, options, systemPrompt } = JSON.parse(Context.get("importExport.data") as string);
      const db = Context.get("app.db") as Database<DatabaseModel>;
      if (variables) db.update("variables", variables);
      if (systemPrompt) db.update("systemPrompt", systemPrompt);
      if (options) db.update("options", options);
      message("Configuration imported...", () => {
        Context.set("importExport.data", "");
      });
    } catch (error) {
      console.error(error);
      message(
        "Something went wrong while importing your configuration. Please check that the file is not corrupted and try again.",
        () => {
          Context.set("importExport.data", "");
        },
      );
    }
  }],
  [ContextEvents.CONTEXT_CHANGE, (e: Event) => {
    const { context, propertyKey } = (e as CustomEvent).detail;
    if (context === "importExport" && propertyKey === "data") {
      const text: HTMLTextAreaElement | null = document.querySelector("#import-export");
      if (text) text.value = Context.get("importExport.data") as string;
      if (Context.get("importExport.data")) {
        document.querySelector("#btn-accept-import")?.removeAttribute("disabled");
      } else {
        document.querySelector("#btn-accept-import")?.setAttribute("disabled", "");
      }
    }
  }],
]);

const onReadyList = new Set([
  () => {
    Context.create("importExport");
    Context.set("importExport.data", "");
  },
  () => {
    document.querySelector("#panel-import-export")?.addEventListener("dragover", (e: Event) => {
      e.preventDefault();
      Dialog.open("#dialog-import");
    });
    document.querySelector("#panel-import-export")?.addEventListener("dragleave", (e: Event) => {
      if (!(e as DragEvent).relatedTarget || !document.body.contains((e as DragEvent).relatedTarget as Node)) {
        Dialog.close("#dialog-import");
      }
    });
    document.querySelector("#dialog-import")?.addEventListener("drop", (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        const files = (e as DragEvent).dataTransfer?.files ?? [];
        if (files.length > 0) {
          uploadJSON(files[0]);
        }
      } catch (_) {
        message("Unable to upload the provided JSON file.");
      } finally {
        Dialog.close("#dialog-import");
      }
    });
    document.querySelector("#import-file")?.addEventListener("change", (e: Event) => {
      try {
        const files = (e.target as HTMLInputElement).files ?? [];
        if (files.length > 0) {
          uploadJSON(files[0]);
        }
      } catch (_) {
        message("Unable to upload the provided JSON file.");
      }
    });
  },
]);

export { CustomEvents };

export default {
  eventsMap,
  onReadyList,
};
