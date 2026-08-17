const list = document.getElementById("packages");
const search = document.getElementById("search");

async function load() {
  let r;
  try {
    r = await fetch("./index.json");
  } catch {
    list.innerHTML = "<p class=empty>index.json yüklenemedi</p>";
    return;
  }
  if (!r.ok) {
    list.innerHTML = "<p class=empty>index yüklenemedi</p>";
    return;
  }
  const idx = await r.json();
  const pkgs = idx.packages || {};
  render(pkgs);
  search.addEventListener("input", () => render(pkgs));
}

function render(pkgs) {
  const q = search.value.trim().toLowerCase();
  const entries = Object.values(pkgs)
    .filter(p => !q
      || p.name.toLowerCase().includes(q)
      || (p.description || "").toLowerCase().includes(q))
    .sort((a, b) => a.name.localeCompare(b.name));
  if (!entries.length) {
    list.innerHTML = "<p class=empty>paket yok</p>";
    return;
  }
  list.innerHTML = entries.map(p => `
    <div class="card">
      <div class="card-head">
        <h2>${esc(p.name)}</h2>
        <span class="ver">${esc(p.version)}</span>
      </div>
      <p>${esc(p.description || "")}</p>
      <p class="meta">${esc(p.arch || "her platform")} · ${human(p.size)} · ${esc(p.author || "anonim")}</p>
      <pre><code>sudo ark install ${esc(p.name)}</code></pre>
      <a class="btn small" href="${esc(p.url)}">indir .ark</a>
    </div>`).join("");
}

function human(n) {
  if (n < 1024) return n + " B";
  const u = ["KB", "MB", "GB"];
  let i = -1;
  do { n /= 1024; i++; } while (n >= 1024 && i < u.length - 1);
  return n.toFixed(1) + " " + u[i];
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

load();