/** Convert LaTeX `\(...\)` / `\[...\]` delimiters to `$` / `$$` for remark-math. */
export function normalizeMathDelimiters(markdown: string) {
  return markdown
    .replace(/\\\[([\s\S]*?)\\\]/g, (_match, body: string) => `\n$$\n${body.trim()}\n$$\n`)
    .replace(/\\\(([\s\S]*?)\\\)/g, (_match, body: string) => `$${body}$`)
}
