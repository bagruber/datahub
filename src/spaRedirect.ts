// SPA redirect handshake with 404.html — restores the path the user asked for.
// Part of the bundle instead of inline in index.html: moosburg.eu sends a CSP
// with script-src 'self', which blocks inline scripts. main.tsx imports this
// first, so it runs before the router reads the location.
const q = window.location.search;
if (q && q.indexOf("p=") !== -1) {
  const params = new URLSearchParams(q);
  const p = params.get("p") || "";
  const qq = params.get("q") || "";
  window.history.replaceState(
    null,
    "",
    window.location.pathname.replace(/\/$/, "") +
      p.replace(/~and~/g, "&") +
      (qq ? "?" + qq.replace(/~and~/g, "&") : "") +
      window.location.hash,
  );
}

export {};
