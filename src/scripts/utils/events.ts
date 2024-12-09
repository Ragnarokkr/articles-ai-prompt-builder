import { Tokan } from "https://raw.githubusercontent.com/Ragnarokkr/tokan.js/refs/heads/master/src/tokan.ts";

type EventListener = (el: HTMLElement) => void;
export type EventHandler = (e: Event) => void | Promise<void>;

let rootElement: HTMLElement;

// supported events
const events = new Map<string, EventListener>([
  ["click", clickEvent],
  ["change", changeEvent],
  ["dragover", dragoverEvent],
  ["dragleave", dragleaveEvent],
]);

function destructEvent(eventParameter: string): [string, string[]] {
  const event: string[] = eventParameter.split("|") ?? [];
  const type: string = event.shift() ?? "";
  return [type, event];
}
// prepare element for handling click events
function clickEvent(element: HTMLElement) {
  const [type, modifiers] = destructEvent(element.dataset.click ?? "");
  if (type.length > 0) {
    element.addEventListener("click", (e: Event) => {
      if (modifiers.includes("prevent")) e.preventDefault();
      if (modifiers.includes("stop")) e.stopPropagation();
      if (modifiers.includes("immediate")) e.stopImmediatePropagation();
      const params: unknown = JSON.parse(((e.target as HTMLElement).dataset.params ?? "{}").replaceAll("'", '"'));
      dispatch(e.target as HTMLElement, type, params);
    });
  }
}

// prepare element for handling change events
function changeEvent(element: HTMLElement) {
  const [type, modifiers] = destructEvent(element.dataset.change ?? "");
  if (type.length > 0) {
    element.addEventListener("change", (e: Event) => {
      if (modifiers.includes("prevent")) e.preventDefault();
      if (modifiers.includes("stop")) e.stopPropagation();
      if (modifiers.includes("immediate")) e.stopImmediatePropagation();
      const params: unknown = JSON.parse(((e.target as HTMLElement).dataset.params ?? "{}").replaceAll("'", '"'));
      dispatch(e.target as HTMLElement, type, { ...params as object, value: (e.target as HTMLInputElement).value });
    });
  }
}

function dragoverEvent(element: HTMLElement) {
  const [type, modifiers] = destructEvent(element.dataset.dragover ?? "");
  if (type.length > 0) {
    element.addEventListener("dragover", (e: Event) => {
      if (modifiers.includes("prevent")) e.preventDefault();
      if (modifiers.includes("stop")) e.stopPropagation();
      if (modifiers.includes("immediate")) e.stopImmediatePropagation();
      const params: unknown = JSON.parse(((e.target as HTMLElement).dataset.params ?? "{}").replaceAll("'", '"'));
      dispatch(e.target as HTMLElement, type, params);
    });
  }
}

function dragleaveEvent(element: HTMLElement) {
  const [type, modifiers] = destructEvent(element.dataset.dragleave ?? "");
  if (type.length > 0) {
    element.addEventListener("dragleave", (e: Event) => {
      if (modifiers.includes("prevent")) e.preventDefault();
      if (modifiers.includes("stop")) e.stopPropagation();
      if (modifiers.includes("immediate")) e.stopImmediatePropagation();
      if (!(e as DragEvent).relatedTarget || !document.body.contains((e as DragEvent).relatedTarget as Node)) {
        const params: unknown = JSON.parse(((e.target as HTMLElement).dataset.params ?? "{}").replaceAll("'", '"'));
        dispatch(e.target as HTMLElement, type, params);
      }
    });
  }
}

// observs for newly added elements and prepare them (and their childrens)
// for handling their events.
function observer() {
  const applyListener = (n: HTMLElement) => {
    if (!("dataset" in n)) return;
    for (const [event, fn] of events) {
      if (event in n.dataset) fn(n);
    }
    if (n.children.length > 0) {
      for (const child of n.children) {
        applyListener(child as HTMLElement);
      }
    }
  };

  const tokan = new Tokan(rootElement);

  tokan.watch(Tokan.MutationKinds.Nodes, {
    subtree: true,
  });

  tokan.on(Tokan.MutationEvents.Added, (n) => {
    applyListener(n as HTMLElement);
  });

  return tokan;
}

/**
 * Initializes the Events system by installing observers and listeners on root element
 * and all DOM elements matching the requirements.
 * @param rootID root DOM element that will behave as router for the event dispatching.
 * @module Events
 */
function init(rootID: string) {
  const rootEl = document.querySelector<HTMLElement>(rootID);
  if (rootEl) {
    rootElement = rootEl;
    observer().start();
    for (const [event, fn] of events) {
      for (const element of rootEl.querySelectorAll<HTMLElement>(`[data-${event}]`)) {
        fn(element);
      }
    }
  }
}

/**
 * Registers all the event listeners provided by the user.
 * @param eventsMap maps of all the event handlers (listeners) to register.
 * @module Events
 */
function register(eventsMap: Map<string, EventHandler>) {
  for (const [event, callback] of eventsMap) {
    rootElement.addEventListener(event, callback);
  }
}

/**
 * Dispatches an custom event in the event system.
 * @param element DOM element the event is dispatched from, or root element if nothing provided.
 * @param eventName the name of the event to dispatch.
 * @param detail custom data provided to the listener of the event.
 * @module Events
 */
function dispatch(element: HTMLElement | null, eventName: string, detail?: unknown) {
  (element ?? rootElement).dispatchEvent(
    new CustomEvent(eventName, {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail,
    }),
  );
}

export { dispatch, init, register };
