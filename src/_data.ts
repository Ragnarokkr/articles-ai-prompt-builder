export const appName = "Articles AI Prompt Builder";
export const appVersion = "0.1.1ɑ";
export const appCodeName = "liminal-selkie";
export const appAuthor = `<a href="https://raiondev.netsons.org/">RaionDev</a>`;
export const appLicense = "Released under MIT License";
export const appCopyright = `©${new Date().getFullYear()}`;
export const appReleaseDate = new Date().toISOString();

export const menuItems = [
  {
    label: "Variables",
    target: "#panel-variables",
    icon: "variables:outlined",
    size: "medium",
    title: "Variables",
    event: { type: "click", name: "menu:select|prevent" },
  },
  {
    label: "System Prompt",
    target: "#panel-system-prompt",
    icon: "text_snippet:outlined",
    size: "medium",
    title: "System Prompt",
    event: { type: "click", name: "menu:select|prevent" },
  },
  {
    label: "Inputs",
    target: "#panel-inputs",
    icon: "input:outlined",
    size: "medium",
    title: "Inputs",
    event: { type: "click", name: "menu:select|prevent" },
  },
  {
    label: "Options",
    target: "#panel-options",
    icon: "settings:outlined",
    size: "medium",
    title: "Options",
    event: { type: "click", name: "menu:select|prevent" },
  },
  {
    label: "Import/Export",
    target: "#panel-import-export",
    icon: "files:outlined",
    size: "medium",
    title: "Import/Export",
    event: { type: "click", name: "menu:select|prevent" },
  },
  {
    label: "Help",
    target: "#panel-help",
    icon: "help:outlined",
    size: "medium",
    title: "Help",
    selected: true,
    event: { type: "click", name: "menu:select|prevent" },
  },
];
