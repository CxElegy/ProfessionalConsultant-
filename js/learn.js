/* 学習リソース：外部学習サイトへの案内と学習記録 */
(function () {
  "use strict";
  const R = window.DOJO_RESOURCES;
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const KEY = "consultant-dojo-resources-v1";
  let mem = {};
  let prog;
  try { prog = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { prog = mem; }
  prog = Object.assign({ done: {}, notes: {} }, prog);
  const save = () => { mem = prog; try { localStorage.setItem(KEY, JSON.stringify(prog)); } catch (e) { /* ignore */ } };
  const today = () => new Date().toLocaleDateString("sv-SE");

  const all = R.flatMap((g) => g.items.map((it) => Object.assign({ group: g }, it)));
  const doneCount = (g) => (g ? g.items : all).filter((it) => prog.done[it.id]).length;
  const nextItem = () => all.find((it) => !prog.done[it.id]) || null;

  window.DojoLearn = {
    summary() { return { done: doneCount(), total: all.length, next: nextItem() }; },
    doneDates() { return Object.values(prog.done); },
    data() { return prog; },
    reset() { prog = { done: {}, notes: {} }; save(); }
  };

  let filter = "all";
  const bar = (n, t) => `<div class="progress"><span style="width:${t ? (n / t) * 100 : 0}%"></span></div>`;

  function card(it) {
    const done = !!prog.done[it.id];
    return `<li class="res ${done ? "done" : ""}">
      <div class="res-main">
        <a class="res-title" href="${esc(it.url)}" target="_blank" rel="noopener noreferrer">${esc(it.title)}<span class="ext" aria-hidden="true"> ↗</span><span class="sr-only">（新しいタブで開く）</span></a>
        <p class="res-meta small"><span>${esc(it.site)}</span>
          <span class="tag">${it.lang === "en" ? "英語" : "日本語"}</span>
          ${it.cost ? `<span class="tag cost">${esc(it.cost)}</span>` : `<span class="tag muted-tag">料金は公式で確認</span>`}</p>
        <p class="small res-use">${esc(it.use)}</p>
        <details ${prog.notes[it.id] ? "open" : ""}><summary class="small">学んだことメモ</summary>
          <textarea rows="2" data-note="${it.id}" placeholder="学んだこと・仕事で試すことを1行で">${esc(prog.notes[it.id] || "")}</textarea></details>
      </div>
      <label class="res-check"><input type="checkbox" data-done="${it.id}" ${done ? "checked" : ""}><span class="small">学習済み</span></label>
    </li>`;
  }

  function render() {
    const n = doneCount(), next = nextItem();
    const groups = R.filter((g) => filter === "all" || g.id === filter);
    $("#learn-root").innerHTML = `
      <h1 class="page-title">学習リソース</h1>
      <p class="lead">学習は、信頼できる外部の学習サイトで行います。ここではテーマ別におすすめのサイトを案内し、どこまで学んだかを記録します。リンクは新しいタブで開きます。</p>
      <div class="card course-summary">
        <div class="card-head"><h2>学習の進捗</h2><span class="muted">${n} / ${all.length} 件 学習済み</span></div>
        ${bar(n, all.length)}
        ${next ? `<p class="small muted next-label">次のおすすめ</p><a class="next-link" href="${esc(next.url)}" target="_blank" rel="noopener noreferrer">${esc(next.title)} <span class="muted small">— ${esc(next.site)}</span> ↗</a>` : `<p><b>すべて学習済みです。</b> 演習タブで実際に使い、型を身につけましょう。</p>`}
      </div>
      <div class="filters">
        <button class="chip ${filter === "all" ? "on" : ""}" data-f="all">すべて</button>
        ${R.map((g) => `<button class="chip ${filter === g.id ? "on" : ""}" data-f="${g.id}">${esc(g.title)}</button>`).join("")}
      </div>
      ${groups.map((g) => `
        <section class="card res-group">
          <div class="card-head"><h2>${esc(g.title)}</h2><span class="muted small">${doneCount(g)} / ${g.items.length}</span></div>
          <p class="muted small">${esc(g.desc)}</p>
          ${bar(doneCount(g), g.items.length)}
          <ul class="res-list">${g.items.map(card).join("")}</ul>
        </section>`).join("")}
      <p class="small muted">各リンク先の内容・料金・公開状況は、運営元の判断で変わることがあります（2026年11月時点で掲載を確認）。</p>`;
  }

  document.addEventListener("click", (e) => {
    const f = e.target.closest("#learn-root [data-f]");
    if (f) { filter = f.dataset.f; render(); }
  });
  document.addEventListener("change", (e) => {
    const id = e.target.dataset && e.target.dataset.done;
    if (!id) return;
    if (e.target.checked) prog.done[id] = today(); else delete prog.done[id];
    save(); render();
  });
  document.addEventListener("input", (e) => {
    const id = e.target.dataset && e.target.dataset.note;
    if (!id) return;
    const v = e.target.value.trim();
    if (v) prog.notes[id] = v; else delete prog.notes[id];
    save();
  });

  render();
})();
