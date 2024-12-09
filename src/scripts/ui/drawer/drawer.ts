const CustomClasses = {
  IS_OPENED: "is-opened",
};

const CustomEvents = {
  DRAWER_TOGGLE: "drawer:toggle",
} as const;

const eventsMap = new Map([
  [CustomEvents.DRAWER_TOGGLE, (e: Event) => {
    const { target } = (e as CustomEvent).detail;
    if (target) {
      document.querySelector<HTMLElement>(target)?.classList.toggle(CustomClasses.IS_OPENED);
    }
  }],
]);

export { CustomClasses, CustomEvents };

export default {
  eventsMap,
};
