const CustomClasses = {
  IS_SELECTED: "is-selected",
} as const;

const CustomEvents = {
  MENU_SELECT: "menu:select",
} as const;

const eventsMap = new Map([
  [CustomEvents.MENU_SELECT, (e: Event) => {
    const target = (e.target as HTMLElement).getAttribute("href");
    if (target) {
      for (const item of document.querySelectorAll<HTMLElement>(".ui-menu-item")) {
        if (item.getAttribute("href") === target) {
          if (!item.classList.contains(CustomClasses.IS_SELECTED)) {
            item.classList.add(CustomClasses.IS_SELECTED);
          }
        } else {
          item.classList.remove(CustomClasses.IS_SELECTED);
        }
      }
    }
  }],
]);

const onReadyList = new Set([
  () => {
    document.querySelector<HTMLElement>(`.ui-menu-item.${CustomClasses.IS_SELECTED}`)?.click();
  },
]);

export { CustomClasses, CustomEvents };
export default {
  eventsMap,
  onReadyList,
};
