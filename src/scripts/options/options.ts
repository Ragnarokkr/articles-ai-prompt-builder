import enableSEO from "./enableSEO.ts";

type OptionDescriptor = {
  id: string;
  name: string;
  defaultValue: boolean;
  fn: (...params: OptionParams) => OptionResult;
};

type OptionParams = (string | undefined)[];
type OptionResult = string;
type OptionModel = Record<string, boolean>;

export { type OptionDescriptor, type OptionModel, type OptionParams, type OptionResult };

export default [enableSEO] as const;
