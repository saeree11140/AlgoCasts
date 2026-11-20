import { Marked } from 'marked';

const escapeHtml = value => value.replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char]);

const markdown = new Marked({ renderer: {
  html({ text }) {
    return escapeHtml(text);
  },
  link({ href, title, tokens }) {
    const label = this.parser.parseInline(tokens);
    if (!/^https?:\/\//i.test(href)) return label;
    const tooltip = title ? ` title="${escapeHtml(title)}"` : '';
    return `<a href="${escapeHtml(href)}"${tooltip} target="_blank" rel="noopener noreferrer">${label}</a>`;
  },
} });

export function renderCompetencyMarkdown(source, title) {
  return `<!doctype html>
<html lang="th">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'">
<title>${escapeHtml(title)}</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; background: #f6f8fc; color: #1c2940; font: 16px/1.7 system-ui, sans-serif; overflow-wrap: anywhere; }
  main { max-width: 920px; margin: auto; padding: clamp(16px, 4vw, 42px); }
  h1, h2, h3 { line-height: 1.35; }
  h1 { font-size: clamp(1.6rem, 4vw, 2.45rem); margin-top: 0; }
  h2 { margin-top: 2.25em; padding-bottom: .35em; border-bottom: 1px solid #d3deee; }
  blockquote { margin: 1em 0; padding: .1em 1em; background: #eaf1fd; border-inline-start: 4px solid #3767bd; }
  pre, code { font-family: ui-monospace, monospace; font-size: .9em; }
  code { background: #eaf0f9; border-radius: 4px; padding: .12em .25em; }
  pre { overflow-x: auto; background: #18243a; color: #f0f5ff; padding: 1em; border-radius: 8px; }
  pre code { background: transparent; font-size: inherit; padding: 0; }
  table { width: 100%; margin: 1em 0; border-collapse: collapse; background: #fff; }
  th, td { padding: .45em .65em; border: 1px solid #d3deee; text-align: start; vertical-align: top; }
  th { background: #eaf1fd; }
  ul, ol { padding-inline-start: 1.5em; }
  hr { margin: 2em 0; border: 0; border-top: 1px solid #d3deee; }
  a { color: #214d9a; }
</style>
</head>
<body>
<main>
${markdown.parse(source)}
</main>
</body>
</html>
`;
}
