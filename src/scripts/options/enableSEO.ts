import { DatabaseModel } from "../model.ts";
import Context from "../utils/context.ts";
import Database from "../utils/database.ts";
import { type OptionModel, type OptionParams, type OptionResult } from "./options.ts";

const id = "enableSEO";
const name = "Enable SEO";
const defaultValue = false;

function enableSEO(...params: OptionParams): OptionResult {
  const [text] = params;
  if (text === undefined) return "";

  const db = Context.get("app.db") as Database<DatabaseModel>;
  const options = db.query("options") as OptionModel;
  if (options[id]) return text;
  else return "";
}

export default { id, name, defaultValue, fn: enableSEO };
