/* Daily Card：1日1枚。例を読んで、課題を自分で解き、解答例と比べる。 */
(function () {
  "use strict";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---- 出題順：テーマを1つずつ巡回 ---- */
  const CARDS = window.DOJO_CARDS;
  const themes = [...new Set(CARDS.map((c) => c.theme))];
  const byTheme = themes.map((t) => CARDS.filter((c) => c.theme === t));
  const order = [];
  for (let i = 0; i < Math.max(...byTheme.map((a) => a.length)); i++) byTheme.forEach((a) => { if (a[i]) order.push(a[i]); });
  const byId = Object.fromEntries(CARDS.map((c) => [c.id, c]));

  const RATINGS = {
    good: { label: "◎ できた", days: 45 },
    ok: { label: "○ だいたい", days: 14 },
    again: { label: "△ もう一度", days: 3 }
  };

  /* ---- 保存 ---- */
  const KEY = "daily-card-v2";
  let mem = null;
  let state;
  try { state = JSON.parse(localStorage.getItem(KEY)); } catch (e) { state = mem; }
  state = Object.assign({ days: {}, cards: {} }, state || {});
  const save = () => { mem = state; try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ } };

  const dkey = (d) => d.toLocaleDateString("sv-SE");
  const today = () => dkey(new Date());
  const addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return dkey(d); };
  const fmt = (k) => new Date(k + "T00:00").toLocaleDateString("ja-JP", { month: "short", day: "numeric", weekday: "short" });

  /* ---- 今日のカードを決める ---- */
  function pick(excludeId) {
    const t = today();
    const due = (r) => Object.entries(state.cards)
      .filter(([id, c]) => id !== excludeId && byId[id] && r.includes(c.rating) && c.due <= t)
      .sort((a, b) => (a[1].due < b[1].due ? -1 : 1));
    const again = due(["again"]);
    if (again.length) return { id: again[0][0], review: true };
    const fresh = order.find((c) => !state.cards[c.id] && c.id !== excludeId);
    if (fresh) return { id: fresh.id, review: false };
    const rest = due(["ok", "good"]);
    if (rest.length) return { id: rest[0][0], review: true };
    return null;
  }
  function todayEntry() {
    const t = today();
    if (!state.days[t]) {
      const p = pick();
      if (!p) return null;
      state.days[t] = { id: p.id, review: p.review, answer: "", revealed: false, checks: [], done: false };
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

  /* ---- 表示パーツ ---- */
  function exampleHtml(c) {
    const ex = c.example;
    return `<section class="block example"><h3>例</h3>
      ${ex.before ? `<p class="ba"><span class="ba-mark bad" aria-label="よくない例">✕</span><span>${esc(ex.before)}</span></p>` : ""}
      <p class="ba"><span class="ba-mark good" aria-label="よい例">${ex.before ? "○" : "▶"}</span><span>${esc(ex.after)}</span></p>
      ${ex.note ? `<p class="small muted">${esc(ex.note)}</p>` : ""}
    </section>`;
  }
  function headHtml(c, e) {
    return `<div class="card-meta"><span class="tag">${esc(c.theme)}</span>${e.review ? `<span class="tag review">復習</span>` : ""}</div>
      <h2>${esc(c.title)}</h2>
      <p class="point">${esc(c.point)}</p>
      ${c.ref ? `<p class="small ref">用語の参考：<a href="${esc(c.ref[1])}" target="_blank" rel="noopener noreferrer">グロービス経営大学院 MBA用語集「${esc(c.ref[0])}」 ↗</a></p>` : ""}`;
  }
  const taskHtml = (c) => `<section class="block task"><h3>課題</h3><p>${esc(c.task)}</p></section>`;

  /* ---- 今日のカード ---- */
  function renderToday() {
    const box = $("#today");
    const e = todayEntry();
    if (!e) {
      box.innerHTML = `<article class="card big-card"><p class="card-kicker">ALL CLEAR</p><h2>今日の課題はありません</h2><p class="muted">全${CARDS.length}枚を解き終え、復習の予定もまだ先です。「わたしのカード」で過去の回答を見直してみましょう。</p></article>`;
      return;
    }
    const c = byId[e.id];
    const prev = state.cards[e.id];

    if (e.done) {
      box.innerHTML = `<article class="card big-card done-card">
        <p class="card-kicker">今日の課題は完了 ✓ <span class="rating r-${e.rating}">${RATINGS[e.rating].label}</span></p>
        ${headHtml(c, e)}
        ${taskHtml(c)}
        <section class="block mine"><h3>あなたの回答</h3><p>${esc(e.answer) || "<span class='muted'>（未記入）</span>"}</p></section>
        <details class="block model"><summary>解答例をもう一度見る</summary><p>${esc(c.model)}</p></details>
        <p class="muted small">${e.rating === "again" ? `このカードは ${fmt(state.cards[e.id].due)} に復習で出てきます。` : ""}また明日、次のカードが届きます。</p>
        <button class="link-btn small" id="redo">採点をやり直す</button>
      </article>`;
      $("#redo").addEventListener("click", () => { e.done = false; save(); renderAll(); });
      return;
    }

    if (!e.revealed) {
      box.innerHTML = `<article class="card big-card">
        ${headHtml(c, e)}
        ${exampleHtml(c)}
        ${taskHtml(c)}
        <label for="answer" class="answer-label">あなたの回答</label>
        <textarea id="answer" rows="5" placeholder="まずは自分の言葉で書いてみましょう。完璧でなくて大丈夫です。">${esc(e.answer)}</textarea>
        <details class="hint"><summary>ヒントを見る</summary><p>${esc(c.hint)}</p></details>
        <div class="row">
          <button class="btn" id="reveal">解答例と比べる</button>
          <button class="link-btn small" id="giveup">思いつかないので解答例を見る</button>
          ${e.review ? "" : `<button class="link-btn small" id="swap">別の課題にする</button>`}
        </div>
        <p class="small warn" id="msg" role="status"></p>
      </article>`;
      $("#answer").addEventListener("input", (ev) => { e.answer = ev.target.value; save(); });
      $("#reveal").addEventListener("click", () => {
        if (!e.answer.trim()) { $("#msg").textContent = "まず自分の回答を書いてから比べましょう。"; $("#answer").focus(); return; }
        e.revealed = true; save(); renderToday();
      });
      $("#giveup").addEventListener("click", () => { e.revealed = true; save(); renderToday(); });
      const sw = $("#swap");
      if (sw) sw.addEventListener("click", () => {
        const p = pick(e.id);
        if (!p) { $("#msg").textContent = "ほかに出せる課題がありません。"; return; }
        Object.assign(e, { id: p.id, review: p.review, answer: "", revealed: false, checks: [] }); save(); renderToday();
      });
      return;
    }

    // 解答例と比べて自己採点
    box.innerHTML = `<article class="card big-card">
      ${headHtml(c, e)}
      ${taskHtml(c)}
      <div class="compare">
        <section class="block mine"><h3>あなたの回答</h3><p>${esc(e.answer) || "<span class='muted'>（未記入）</span>"}</p></section>
        <section class="block model"><h3>解答例</h3><p>${esc(c.model)}</p></section>
      </div>
      ${prev && prev.answer && e.review ? `<details class="block"><summary>前回（${fmt(prev.date)}）の回答</summary><p>${esc(prev.answer)}</p></details>` : ""}
      <section class="block"><h3>チェックポイント</h3>
        <ul class="checks">${c.checks.map((x, i) => `<li><label><input type="checkbox" data-ck="${i}" ${e.checks.includes(i) ? "checked" : ""}> ${esc(x)}</label></li>`).join("")}</ul>
      </section>
      <p class="answer-label">自己採点して完了</p>
      <div class="rate">
        ${Object.entries(RATINGS).map(([k, r]) => `<button class="rate-btn r-${k}" data-rate="${k}">${r.label}${k === "again" ? `<small>3日後にもう一度出題</small>` : ""}</button>`).join("")}
      </div>
      <button class="link-btn small" id="back">回答を書き直す</button>
    </article>`;
    $$("[data-ck]").forEach((cb) => cb.addEventListener("change", () => {
      e.checks = $$("[data-ck]:checked").map((x) => +x.dataset.ck); save();
    }));
    $$("[data-rate]").forEach((b) => b.addEventListener("click", () => {
      const r = b.dataset.rate;
      e.rating = r; e.done = true; e.doneAt = new Date().toISOString();
      state.cards[e.id] = { rating: r, due: addDays(RATINGS[r].days), date: today(), answer: e.answer };
      save(); renderAll();
    }));
    $("#back").addEventListener("click", () => { e.revealed = false; save(); renderToday(); });
  }

  /* ---- 記録とわたしのカード ---- */
  function renderStats() {
    const solved = Object.keys(state.cards).filter((id) => byId[id]).length;
    const again = Object.values(state.cards).filter((c) => c.rating === "again").length;
    $("#stats").innerHTML = [
      ["連続", streak(), "日"],
      ["解いた課題", solved, `/ ${CARDS.length}`],
      ["復習待ち", again, "枚"]
    ].map(([l, v, u]) => `<div class="stat"><span class="stat-label">${l}</span><span class="stat-value">${v}<small>${u}</small></span></div>`).join("");
  }

  function renderDeck() {
    const days = Object.entries(state.days).filter(([, d]) => d.done && byId[d.id]).sort((a, b) => (a[0] < b[0] ? 1 : -1));
    $("#deck-count").textContent = `${days.length}枚`;
    let dots = "";
    for (let k = 27; k >= 0; k--) {
      const d = new Date(); d.setDate(d.getDate() - k);
      const day = state.days[dkey(d)];
      dots += `<span class="dot ${day && day.done ? "on r-" + day.rating : ""} ${k === 0 ? "today" : ""}" title="${dkey(d)}${day && day.done ? "：" + RATINGS[day.rating].label : ""}"></span>`;
    }
    $("#dots").innerHTML = dots;
    if (!days.length) { $("#deck").innerHTML = `<p class="muted empty">解いた課題がここに貯まっていきます。</p>`; return; }
    $("#deck").innerHTML = days.map(([date, d]) => {
      const c = byId[d.id];
      return `<article class="card mini">
        <div class="mini-top"><span class="small muted">${fmt(date)}</span><span class="rating r-${d.rating}">${RATINGS[d.rating].label}</span></div>
        <div class="card-meta"><span class="tag">${esc(c.theme)}</span>${d.review ? `<span class="tag review">復習</span>` : ""}</div>
        <h3>${esc(c.title)}</h3>
        <p class="mini-answer">${esc(d.answer) || "（未記入）"}</p>
        <details><summary class="small">課題と解答例</summary><p class="small"><b>課題：</b>${esc(c.task)}</p><p class="small"><b>解答例：</b>${esc(c.model)}</p></details>
      </article>`;
    }).join("");
  }

  function renderAll() {
    $("#date").textContent = new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "short" });
    renderStats(); renderToday(); renderDeck();
  }

  $("#export").addEventListener("click", () => {
    const rows = Object.entries(state.days).filter(([, d]) => d.done && byId[d.id]).sort().map(([date, d]) => ({
      date, theme: byId[d.id].theme, title: byId[d.id].title, task: byId[d.id].task, answer: d.answer, model: byId[d.id].model, rating: RATINGS[d.rating].label
    }));
    const blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `daily-cards-${today()}.json`; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });

  // タブを開いたまま日付が変わったら、新しいカードに切り替える
  let shown = today();
  document.addEventListener("visibilitychange", () => { if (!document.hidden && today() !== shown) { shown = today(); renderAll(); } });

  renderAll();
})();
