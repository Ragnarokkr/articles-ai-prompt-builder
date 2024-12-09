import Context from "../../../utils/context.ts";
import Database from "../../../utils/database.ts";
import { type DatabaseModel } from "../../../model.ts";

type VariableDescriptor = {
  id: string;
  name: string;
  type: string;
  data: string[];
};

function sort(list: VariableDescriptor[]) {
  return list.sort((a, b) => {
    if (a.name < b.name) return -1;
    if (a.name === b.name) return 0;
    else return 1;
  });
}

function add(newItem: VariableDescriptor) {
  if (!newItem) return;

  try {
    const db = Context.get("app.db") as Database<DatabaseModel>;
    const vars = db.query("variables") as VariableDescriptor[];
    db.update("variables", sort([...vars, newItem]));
  } catch (err) {
    console.assert(!err, "unexpected error assigning new variable (%o).", newItem);
  }
}

function update(updatedItem: VariableDescriptor) {
  if (!updatedItem) return;
  try {
    const db = Context.get("app.db") as Database<DatabaseModel>;
    const vars = db.query("variables") as VariableDescriptor[];
    for (const item of vars) {
      if (item.id === updatedItem.id) {
        item.name = updatedItem.name;
        item.type = updatedItem.type;
        item.data = updatedItem.data;
        break;
      }
    }
    db.update("variables", sort(vars));
  } catch (err) {
    console.error(`unable to update the item with id:${updatedItem.id}: ${err}`);
  }
}

export { type VariableDescriptor };

export default { add, update };
