import { DatabaseModel } from "../../../model.ts";
import Context from "../../../utils/context.ts";
import Database from "../../../utils/database.ts";
import { type ChipDescriptor, type TagDescriptor } from "./model.ts";

type DefaultTagDescriptor = {
  name: string;
  setup: (text?: string) => string;
};

function replaceFn(match: string) {
  const tag = match.replace(/[\{\}]+/g, "");
  const { setup } = (Context.get("inputs.tags") as TagDescriptor[]).find((i) => i.name == tag) ?? {};
  if (!setup) {
    const compositeTag = tag.split(":");
    for (const defaultTag of defaultTags) {
      if (defaultTag.name == compositeTag[0]) {
        return defaultTag.setup(compositeTag[1]);
      }
    }
    return "";
  } else return setup.join(",");
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
      return context.join("\n").replace(/\{\{(\w+)\}\}/g, replaceFn);
    },
  },
  {
    name: "seo",
    setup: (text: string = ""): string => {
      const db = Context.get("app.db") as Database<DatabaseModel>;
      const options = db.query("options") as Record<string, boolean>;
      if (options["enableSEO"]) return text;
      else return "";
    },
  },
] as const;

export { replaceFn };

export default defaultTags;
