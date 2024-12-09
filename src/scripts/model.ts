import { type VariableDescriptor } from "./ui/panels/variables/model.ts";

type DatabaseModel = {
  variables: VariableDescriptor[];
  systemPrompt: string;
  options: Record<string, boolean>;
};

type ServiceData = {
  eventsMap?: Map<string, (e: Event) => void>;
  onReadyList?: Set<() => void | Promise<void>>;
};

export { type DatabaseModel, type ServiceData };
