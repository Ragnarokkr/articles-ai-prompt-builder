# Articles AI Prompt Builder

This is a recreational programming proof-of-concept for a Single Page Web Application designed to assist in building
prompts for AI assistants, with a particular focus on creating textual prompts intended for articles.

The application works as a simple merger and text replacement tool, allowing users to define various configurable
variables (currently limited to single/multiple selection lists), a system prompt, and multiple pieces of text (referred
to as "chips"). Users can also reorder the chips according to their needs.

Once all the text is merged with the system prompt, the inserted variables are replaced with the configured options. The
final output is then returned to the user for a final review before copying and pasting it into their preferred AI
assistant.

The options are still a work in progress, and I am considering additional features. Currently, the application includes
a flag (`Enable SEO`) to enable or disable the use of text in chips based on these settings.

Finally, there is a help page where I try to explain as much as I can about how the application works.

Although it seems to work perfectly fine, this is a **very** alpha version. This means that many changes can follow
before reaching a stable release.

## Predefined variables

There are a few predefined variables that the user can use in the system prompt and chip text:

| Variable    | Syntax         | Description                                                                                                                            |
| :---------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------------- |
| **date**    | `{{date}}`     | Placeholder for the current date and time in local format.                                                                             |
| **context** | `{{context}}`  | It's the placeholder for the merged chips.                                                                                             |
| **seo**     | `{{seo:text}}` | It corresponds to the **Enable SEO** option. It acts as a flag; if checked, the text will be used; otherwise, nothing will be printed. |

## TODOs

- [ ] Add a filtering system in the variables configuration dialog.
- [ ] Filtering chips to prevent the use of `{{context}}`, which can generate infinite loops.
- [ ] Fine tune light and dark themes to enhance the user experience.
- [ ] Implement automatic filters to apply to the chips during the merging process.
- [ ] Increase the number of predefined variables, which could potentially increase the number of options.