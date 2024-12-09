import { dispatch } from "../../utils/events.ts";
import { CustomEvents as MenuEvents } from "../menu/menu.ts";

const CustomClasses = {
  IS_OPENED: "is-opened",
} as const;

const CustomEvents = {
  PANELS_OPEN: "panels:open",
  PANELS_CLOSE: "panels_close",
} as const;

const eventsMap = new Map([
  [MenuEvents.MENU_SELECT, (e: Event) => {
    const target = (e.target as HTMLElement).getAttribute("href");
    if (target) {
      for (const item of document.querySelectorAll<HTMLElement>(".ui-panel")) {
        if (item.getAttribute("id") === target.substring(1)) {
          item.classList.add(CustomClasses.IS_OPENED);
          dispatch(item, CustomEvents.PANELS_OPEN, { target: item });
        } else {
          item.classList.remove(CustomClasses.IS_OPENED);
          dispatch(item, CustomEvents.PANELS_CLOSE, { target: item });
        }
      }
    }
  }],
]);

export { CustomClasses, CustomEvents };

export default {
  eventsMap,
};
