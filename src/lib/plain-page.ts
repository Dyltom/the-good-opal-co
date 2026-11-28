export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

const STYLES = `
*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:grid;place-items:center;padding:16px;background:#f5f2ec;color:#1c1813;font:16px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}
main{width:100%;max-width:420px;background:#fff;border:1px solid #e4ddd1;border-radius:12px;padding:28px}
.brand{margin:0 0 20px;font:600 13px/1 system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#7a5c24}
h1{margin:0 0 12px;font:500 26px/1.2 Georgia,serif}
p{margin:0 0 16px;color:#544c42}
ul{margin:0 0 20px;padding-left:20px;color:#544c42}
li{margin:4px 0}
label{display:block;margin:0 0 6px;font-weight:600;font-size:14px}
.photos{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:0 0 16px}
.photos img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:6px;background:#f5f2ec}
.done{padding:12px;border-radius:8px;background:#eaf5ec;color:#1f5a2b}
input{display:block;width:100%;margin:0 0 16px;padding:12px;font:inherit;border:1px solid #cfc7bb;border-radius:8px;background:#fff;color:inherit}
input:focus{outline:2px solid #7a5c24;outline-offset:1px}
button,.button{display:block;width:100%;padding:13px 16px;font:600 16px/1.2 inherit;font-family:inherit;text-align:center;text-decoration:none;border:0;border-radius:8px;background:#1c1813;color:#fff;cursor:pointer}
.secondary{display:block;margin-top:14px;text-align:center;color:#544c42;font-size:14px}
.error{padding:12px;border-radius:8px;background:#fbeaea;color:#8a1f1f}
.who{padding:12px;border-radius:8px;background:#f5f2ec;color:#1c1813}
`

export function page(title: string, content: string, status = 200, refreshTo?: string): Response {
  const refresh = refreshTo
    ? `<meta http-equiv="refresh" content="0;url=${escapeHtml(refreshTo)}">`
    : ''
  const html = `<!doctype html><html lang="en-AU"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${escapeHtml(title)} · The Good Opal Co</title>${refresh}<style>${STYLES}</style></head><body><main><p class="brand">The Good Opal Co</p>${content}</main></body></html>`
  return new Response(html, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  })
}
