/* Daily Card：1日1枚。外部サイトで学び、要点を自分の言葉でカードにする。 */
(function () {
  "use strict";
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---- カードの順番：テーマを1つずつ巡回 ---- */
  const R = window.DOJO_RESOURCES;
  const order = [];
  const maxLen = Math.max(...R.map((g) => g.items.length));
  for (let i = 0; i < maxLen; i++) R.forEach((g) => { if (g.items[i]) order.push(Object.assign({ theme: g.title }, g.items[i])); });
  const byId = Object.fromEntries(order.map((c) => [c.id, c]));

  /* ---- 保存 ---- */
  const KEY = "daily-card-v1";
  let mem = null;
  let state;
  try { state = JSON.parse(localStorage.getItem(KEY)); } catch (e) { state = mem; }
  state = Object.assign({ days: {} }, state || {});
  const save = () => { mem = state; try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ } };

  const dkey = (d) => d.toLocaleDateString("sv-SE");
  const today = () => dkey(new Date());
  const completed = () => new Set(Object.values(state.days).filter((d) => d.done).map((d) => d.id));

  function pickNext(afterId) {
    const done = completed();
    const start = afterId ? order.findIndex((c) => c.id === afterId) + 1 : 0;
    for (let k = 0; k < order.length; k++) {
      const c = order[(start + k) % order.length];
      if (!done.has(c.id) && c.id !== afterId) return c.id;
    }
    return null;
  }

  function todayEntry() {
    const t = today();
    if (!state.days[t]) {
      const id = pickNext();
      if (!id) return null;
      state.days[t] = { id, done: false };
      save();
    }
    return state.days[t];
  }

  function streak() {
    const d = new Date();
    if (!(state.days[dkey(d)] || {}).done) d.setDate(d.getDate() - 1);
    let n = 0;
    while ((state.days[dkey(d)] || {}).done) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }

  /* ---- 表示 ---- */
  function renderStats() {
    const n = completed().size;
    $("#stats").innerHTML = [
      ["連続", streak(), "日"],
      ["完成カード", n, `/ ${order.length}`]
    ].map(([l, v, u]) => `<div class="stat"><span class="stat-label">${l}</span><span class="stat-value">${v}<small>${u}</small></span></div>`).join("");
  }

  function meta(c) {
    return `<span class="tag">${esc(c.theme)}</span><span class="tag plain">${c.lang === "en" ? "英語" : "日本語"}</span>${c.cost ? `<span class="tag plain">${esc(c.cost)}</span>` : ""}`;
  }

  function renderToday() {
    const e = todayEntry();
    const box = $("#today");
    if (!e) {
      box.innerHTML = `<article class="card big-card"><p class="card-kicker">COMPLETE</p><h2>全${order.length}枚のカードが完成しました</h2><p class="muted">「わたしのカード」を読み返して、仕事で使えているか確かめましょう。</p></article>`;
      return;
    }
    const c = byId[e.id];
    if (e.done) {
      box.innerHTML = `<article class="card big-card done-card">
        <p class="card-kicker">今日のカードは完成 ✓</p>
        <div class="card-meta">${meta(c)}</div>
        <h2><a href="${esc(c.url)}" target="_blank" rel="noopener noreferrer">${esc(c.title)} ↗</a></h2>
        <p class="muted small">${esc(c.site)}</p>
        <dl class="note"><dt>要点</dt><dd>${esc(e.point)}</dd>${e.use ? `<dt>仕事でこう使う</dt><dd>${esc(e.use)}</dd>` : ""}</dl>
        <p class="muted small">また明日。次のカードは明日届きます。</p>
        <button class="link-btn small" id="edit">書き直す</button>
      </article>`;
      $("#edit").addEventListener("click", () => { e.done = false; save(); renderAll(); });
      return;
    }
    box.innerHTML = `<article class="card big-card">
      <div class="card-meta">${meta(c)}</div>
      <h2>${esc(c.title)}</h2>
      <p class="muted small">${esc(c.site)}</p>
      <p class="card-use">${esc(c.use)}</p>
      <ol class="steps">
        <li><span>リンク先で読む・見る</span>
          <a class="btn" href="${esc(c.url)}" target="_blank" rel="noopener noreferrer">リンク先を開く ↗</a></li>
        <li><label for="point">学んだ要点を、自分の言葉で一文に</label>
          <textarea id="point" rows="2" placeholder="例：〇〇とは、△△すること。ポイントは□□。">${esc(e.point)}</textarea></li>
        <li><label for="use">明日の仕事でどう使う？（任意）</label>
          <textarea id="use" rows="2" placeholder="例：明日の定例で、報告を結論から話す。">${esc(e.use)}</textarea></li>
      </ol>
      <div class="row">
        <button class="btn" id="finish">カードを完成させる</button>
        <button class="link-btn small" id="swap">別のカードにする</button>
        <span class="small warn" id="msg" role="status"></span>
      </div>
    </article>`;
    const keep = () => { e.point = $("#point").value; e.use = $("#use").value; save(); };
    $("#point").addEventListener("input", keep);
    $("#use").addEventListener("input", keep);
    $("#finish").addEventListener("click", () => {
      keep();
      if (!e.point || !e.point.trim()) { $("#msg").textContent = "要点を一文書いてから完成させましょう。"; $("#point").focus(); return; }
      e.point = e.point.trim(); e.use = (e.use || "").trim(); e.done = true; e.doneAt = new Date().toISOString();
      save(); renderAll();
    });
    $("#swap").addEventListener("click", () => {
      const id = pickNext(e.id);
      if (!id) { $("#msg").textContent = "ほかに未完成のカードはありません。"; return; }
      e.id = id; e.point = ""; e.use = ""; save(); renderToday();
    });
  }

  function renderDeck() {
    const days = Object.entries(state.days).filter(([, d]) => d.done).sort((a, b) => (a[0] < b[0] ? 1 : -1));
    $("#deck-count").textContent = `${days.length}枚`;
    let dots = "";
    for (let k = 27; k >= 0; k--) {
      const d = new Date(); d.setDate(d.getDate() - k);
      const done = (state.days[dkey(d)] || {}).done;
      dots += `<span class="dot ${done ? "on" : ""} ${k === 0 ? "today" : ""}" title="${dkey(d)}${done ? "：完成" : ""}"></span>`;
    }
    $("#dots").innerHTML = dots;
    if (!days.length) { $("#deck").innerHTML = `<p class="muted empty">完成したカードがここに貯まっていきます。</p>`; return; }
    $("#deck").innerHTML = days.map(([date, d]) => {
      const c = byId[d.id]; if (!c) return "";
      return `<article class="card mini">
        <p class="small muted">${new Date(date + "T00:00").toLocaleDateString("ja-JP", { month: "short", day: "numeric", weekday: "short" })}</p>
        <div class="card-meta">${meta(c)}</div>
        <h3><a href="${esc(c.url)}" target="_blank" rel="noopener noreferrer">${esc(c.title)} ↗</a></h3>
        <p class="mini-point">${esc(d.point)}</p>
        ${d.use ? `<p class="small muted">→ ${esc(d.use)}</p>` : ""}
      </article>`;
    }).join("");
  }

  function renderAll() {
    $("#date").textContent = new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "short" });
    renderStats(); renderToday(); renderDeck();
  }

  $("#export").addEventListener("click", () => {
    const rows = Object.entries(state.days).filter(([, d]) => d.done).sort().map(([date, d]) => {
      const c = byId[d.id] || {};
      return { date, theme: c.theme, title: c.title, site: c.site, url: c.url, point: d.point, use: d.use };
    });
    const blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `daily-cards-${today()}.json`; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });

  // タブを開いたまま日付が変わったら、新しいカードに切り替える
  let shown = today();
  document.addEventListener("visibilitychange", () => { if (!document.hidden && today() !== shown) { shown = today(); renderAll(); } });

  renderAll();
})();
