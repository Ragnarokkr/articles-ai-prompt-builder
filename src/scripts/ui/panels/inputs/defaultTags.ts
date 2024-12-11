import { OptionDescriptor } from "../../../options/options.ts";
import Context from "../../../utils/context.ts";
import { type ChipDescriptor, type TagDescriptor } from "./model.ts";

type DefaultTagDescriptor = {
  name: string;
  setup: (...params: string[]) => string;
};

function replaceFn(match: string) {
  const tag = match.replace(/[\{\}]+/g, "");
  const { setup } = (Context.get("inputs.tags") as TagDescriptor[]).find((i) => i.name == tag) ?? {};
  if (!setup) {
    const compositeTag = tag.split(":");
    for (const defaultTag of defaultTags) {
      if (defaultTag.name === compositeTag[0]) {
        return defaultTag.setup(...compositeTag.slice(1));
      }
    }
    const options = Context.get("app.options") as OptionDescriptor[];
    for (const option of options) {
      if (option.id === compositeTag[0]) {
        return option.fn(...compositeTag.slice(1));
      }
    }
    return "";
  } else return setup.join(", ");
}

const defaultTags: DefaultTagDescriptor[] = [
  { name: "date", setup: () => new Date().toLocaleString() },
  {
    name: "context",
    setup: () => {
      const context: string[] = [];
      (Context.get("inputs.chips") as ChipDescriptor[]).forEach((chip) => {
        context.push(chip.content);
      });
      return context.join("\n")
        .replace("{{context}}", "")
        .replace(/\{\{(\w+)\}\}/g, replaceFn);
    },
  },
] as const;

export { replaceFn };

export default defaultTags;
