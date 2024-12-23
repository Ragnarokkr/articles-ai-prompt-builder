# Articles AI Prompt Builder

This is a recreational programming proof-of-concept to test how easy it is to build with Lume a Single Page Application
designed to assist in building prompts for AI assistants, with a particular focus on creating textual prompts intended
for articles.

The application works as a simple merger and text replacement tool, allowing users to define various configurable
variables (currently limited to single/multiple selection lists), a system prompt, and multiple pieces of text (referred
to as "chips"). Users can also reorder the chips according to their needs.

Once all the text is merged with the system prompt, the inserted variables are replaced with the configured options. The
final output is then returned to the user for a final review before copying and pasting it into their preferred AI
assistant.

The options are still a work in progress, and I am considering additional features. Currently, the application includes
an option (**Enable SEO**) that can be tagged within chips to enable or disable specific text based on its value
(checked or unchecked).

Finally, there is a help page where I try to explain as much as I can about how the application works.

Although it seems to work perfectly fine, this is a **very** alpha version. This means that many changes can follow
before reaching a stable release.

## Predefined variables

There are a few predefined variables that the user can use in the system prompt and chip text:

| Variable    | Syntax        | Description                                                |
| :---------- | :------------ | :--------------------------------------------------------- |
| **date**    | `{{date}}`    | Placeholder for the current date and time in local format. |
| **context** | `{{context}}` | It's the placeholder for the merged chips.                 |

## Options

Options can be tagged in text using their IDs (e.g., the option **Enable SEO** can be specified with the tag
`{{enableSEO:text}}`).

## TODOs

- [ ] Add a filtering system in the variables configuration dialog.
- [x] Add newline between chips.
- [x] Filtering chips to prevent the use of `{{context}}`, which can generate infinite loops.
- [ ] Fine tune light and dark themes to enhance the user experience.
- [x] Implement a dynamic options system for easier management of additional options, related data, and functions.
- [ ] Implement automatic filters to apply to the chips during the merging process.
- [ ] Implement locales support.
- [ ] Increase the number of predefined variables, which could potentially increase the number of options.
- [ ] Keep the state of choices in variable's setup.
- [ ] Make options filterable based on their taggable or untaggable status.

## License

```
Copyright (C) 2024 Marco Trulla <marco.trulla+dev@gmail.com>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
```
