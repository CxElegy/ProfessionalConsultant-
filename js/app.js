(function () {
  "use strict";
  const D = window.DOJO;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- storage ---------- */
  const KEY = "consultant-dojo-v1";
  let mem = {};
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return mem; }
  }
  let state = Object.assign({ assessments: [], cases: [], fermi: [], quiz: [], habits: {}, kpt: [] }, load());
  function save() {
    mem = state;
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }
  const today = () => new Date().toLocaleDateString("sv-SE"); // YYYY-MM-DD
  const fmtDate = (iso) => new Date(iso).toLocaleDateString("ja-JP", { month: "short", day: "numeric", weekday: "short" });
  const dayIndex = () => Math.floor(Date.now() / 86400000);

  /* ---------- activity / streak ---------- */
  function activeDays() {
    const set = new Set();
    state.assessments.forEach((a) => set.add(a.date));
    state.cases.forEach((a) => set.add(a.date));
    state.fermi.forEach((a) => set.add(a.date));
    state.quiz.forEach((a) => set.add(a.date));
    state.kpt.forEach((a) => set.add(a.date));
    Object.entries(state.habits).forEach(([d, arr]) => { if (arr.length) set.add(d); });
    if (window.DojoLearn) window.DojoLearn.doneDates().forEach((d) => set.add(d));
    return set;
  }
  function streak() {
    const set = activeDays();
    let n = 0;
    const d = new Date();
    if (!set.has(d.toLocaleDateString("sv-SE"))) d.setDate(d.getDate() - 1);
    while (set.has(d.toLocaleDateString("sv-SE"))) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }

  /* ---------- routing ---------- */
  function show(tab) {
    tab = (tab || "").split("/")[0];
    if (!$(`#tab-${tab}`)) tab = "home";
    $$(".tab").forEach((s) => (s.hidden = s.dataset.tab !== tab));
    $$(".nav a").forEach((a) => a.classList.toggle("active", a.dataset.tab === tab));
    $("#nav").classList.remove("open");
    $(".nav-toggle").setAttribute("aria-expanded", "false");
    if (tab === "home") renderHome();
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", () => show(location.hash.slice(1)));
  $(".nav-toggle").addEventListener("click", (e) => {
    const open = $("#nav").classList.toggle("open");
    e.currentTarget.setAttribute("aria-expanded", String(open));
  });

  /* ---------- HOME ---------- */
  function renderHome() {
    const lastA = state.assessments[state.assessments.length - 1];
    const avg = lastA ? (Object.values(lastA.scores).reduce((a, b) => a + b, 0) / D.skills.length).toFixed(1) : "—";
    const quizBest = state.quiz.length ? Math.max(...state.quiz.map((q) => q.score)) : null;
    const stats = [
      ["連続日数", streak(), "日"],
      ["スキル平均", avg, lastA ? "/ 5" : ""],
      ["学習済み", window.DojoLearn ? window.DojoLearn.summary().done : 0, window.DojoLearn ? "/ " + window.DojoLearn.summary().total : ""],
      ["クイズ最高", quizBest === null ? "—" : quizBest, quizBest === null ? "" : "/ 10"]
    ];
    $("#home-stats").innerHTML = stats.map(([l, v, u]) => `<div class="stat"><span class="stat-label">${l}</span><span class="stat-value">${v}<small>${u}</small></span></div>`).join("");

    $("#today-date").textContent = new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "short" });
    const i = dayIndex();
    const fw = D.frameworks[i % D.frameworks.length];
    const cs = D.cases[i % D.cases.length];
    const fq = D.fermi[i % D.fermi.length];
    const focus = focusSkill();
    const items = [
      [`思考の型：<b>${esc(fw.name)}</b> の練習問題に答える`, "#frameworks", "5分"],
      [`フェルミ推定：${esc(fq.q)}`, "#fermi", "5分"],
      [`ケース：<b>${esc(cs.title)}</b> の論点とイシューツリーを書く`, "#case", "15分"],
      ["KPTで今日の仕事を振り返る", "#habits", "3分"]
    ];
    const L = window.DojoLearn && window.DojoLearn.summary();
    if (L && L.next) items.unshift([`学習リソース：<b>${esc(L.next.title)}</b>（${esc(L.next.site)}）を読む`, "#learn", "学ぶ"]);
    if (focus) items.unshift([`重点スキル「<b>${esc(focus.name)}</b>」：次のレベル「${esc(focus.next)}」を意識して1日を過ごす`, "#assess", "意識"]);
    if (!lastA) items.unshift(["まずは<b>スキル自己診断</b>で現在地を知る", "#assess", "5分"]);
    $("#today-menu").innerHTML = items.map(([t, h, m]) => `<li><a href="${h}">${t}</a><span class="pill">${m}</span></li>`).join("");

    const [q, by] = D.quotes[i % D.quotes.length];
    $("#daily-quote").innerHTML = `${esc(q)}<cite>— ${esc(by)}</cite>`;
  }

  /* ---------- ASSESS ---------- */
  function focusSkill() {
    const a = state.assessments[state.assessments.length - 1];
    if (!a) return null;
    let min = null;
    D.skills.forEach((s) => { if (!min || a.scores[s.id] < a.scores[min.id]) min = s; });
    const lv = a.scores[min.id];
    return { name: min.name, lv, next: lv >= 5 ? "このレベルを他者に教える" : min.levels[lv] };
  }
  function initAssess() {
    const form = $("#assess-form");
    const last = state.assessments[state.assessments.length - 1];
    form.innerHTML = D.skills.map((s) => {
      const v = last ? last.scores[s.id] : 3;
      return `<div class="skill">
        <div class="skill-head"><label for="sk-${s.id}"><b>${s.name}</b></label><output id="out-${s.id}">${v}</output></div>
        <p class="muted small">${s.desc}</p>
        <input type="range" min="1" max="5" step="1" value="${v}" id="sk-${s.id}" data-id="${s.id}">
        <p class="level small" id="lv-${s.id}">Lv${v}：${s.levels[v - 1]}</p>
      </div>`;
    }).join("") + `<div class="row"><button class="btn" type="submit">診断を保存</button><span class="muted small" id="assess-msg"></span></div>`;
    form.addEventListener("input", (e) => {
      const id = e.target.dataset.id; if (!id) return;
      const s = D.skills.find((x) => x.id === id); const v = +e.target.value;
      $(`#out-${id}`).textContent = v;
      $(`#lv-${id}`).textContent = `Lv${v}：${s.levels[v - 1]}`;
      drawRadar(currentScores());
    });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const scores = currentScores();
      const d = today();
      state.assessments = state.assessments.filter((a) => a.date !== d);
      state.assessments.push({ date: d, scores });
      save();
      $("#assess-msg").textContent = "保存しました";
      drawRadar(scores); renderFocus();
    });
    drawRadar(currentScores()); renderFocus();
  }
  function currentScores() {
    const o = {}; $$("#assess-form input[type=range]").forEach((r) => (o[r.dataset.id] = +r.value)); return o;
  }
  function renderFocus() {
    const f = focusSkill();
    $("#focus-skill").innerHTML = f ? `<b>${esc(f.name)}</b>（Lv${f.lv}）<br>次の目標：${esc(f.next)}` : "診断を保存すると表示されます。";
  }
  function drawRadar(scores) {
    const N = D.skills.length, R = 110, C = 150;
    const pt = (i, v) => { const a = (Math.PI * 2 * i) / N - Math.PI / 2; return [C + Math.cos(a) * R * (v / 5), C + Math.sin(a) * R * (v / 5)]; };
    const poly = (sc) => D.skills.map((s, i) => pt(i, sc[s.id]).join(",")).join(" ");
    const saved = state.assessments;
    const todayD = today();
    const prev = saved.filter((a) => a.date !== todayD).slice(-1)[0];
    let g = "";
    for (let l = 1; l <= 5; l++) g += `<polygon class="grid" points="${D.skills.map((_, i) => pt(i, l).join(",")).join(" ")}"/>`;
    D.skills.forEach((s, i) => {
      const [x, y] = pt(i, 5); const [lx, ly] = pt(i, 6.1);
      g += `<line class="axis" x1="${C}" y1="${C}" x2="${x}" y2="${y}"/><text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle">${s.name}</text>`;
    });
    if (prev) g += `<polygon class="prev" points="${poly(prev.scores)}"/>`;
    g += `<polygon class="now" points="${poly(scores)}"/>`;
    $("#radar").innerHTML = `<svg viewBox="-70 -5 440 310" role="img" aria-label="スキルレーダーチャート">${g}</svg>`;
  }

  /* ---------- FRAMEWORKS ---------- */
  function initFrameworks() {
    const cats = ["すべて", ...new Set(D.frameworks.map((f) => f.cat))];
    let cur = "すべて";
    const render = () => {
      $("#fw-filters").innerHTML = cats.map((c) => `<button class="chip ${c === cur ? "on" : ""}" data-c="${c}">${c}</button>`).join("");
      $("#fw-list").innerHTML = D.frameworks.filter((f) => cur === "すべて" || f.cat === cur).map((f) => `
        <article class="card fw">
          <span class="tag">${f.cat}</span>
          <h3>${f.name}</h3>
          <p>${f.summary}</p>
          <dl><dt>使う場面</dt><dd>${f.when}</dd><dt>落とし穴</dt><dd>${f.pitfall}</dd></dl>
          ${f.ref ? `<p class="small ref"><a href="${f.ref[1]}" target="_blank" rel="noopener noreferrer">参考：${f.ref[0]} ↗</a></p>` : ""}
          <details><summary>練習問題</summary><p class="practice">${f.practice}</p><textarea rows="3" placeholder="ここに書いてみる（保存はされません）"></textarea></details>
        </article>`).join("");
    };
    $("#fw-filters").addEventListener("click", (e) => { if (e.target.dataset.c) { cur = e.target.dataset.c; render(); } });
    render();
  }

  /* ---------- CASE ---------- */
  function initCase() {
    const sel = $("#case-select");
    sel.innerHTML = D.cases.map((c, i) => `<option value="${i}">${c.title}</option>`).join("");
    sel.value = String(dayIndex() % D.cases.length);
    const renderCase = () => {
      const c = D.cases[+sel.value];
      $("#case-prompt").innerHTML = `<p class="muted small">クライアント：${c.client}</p><p>${c.prompt}</p>`;
      $$(".case-fields textarea").forEach((t) => (t.value = ""));
      $("#case-model").hidden = true; $("#case-msg").textContent = "";
    };
    sel.addEventListener("change", renderCase);
    $("#case-random").addEventListener("click", () => {
      let n; do { n = Math.floor(Math.random() * D.cases.length); } while (D.cases.length > 1 && String(n) === sel.value);
      sel.value = String(n); renderCase();
    });
    renderCase();

    // timer
    let left = 900, t = null;
    const disp = () => { $("#case-timer").textContent = `${String(Math.floor(left / 60)).padStart(2, "0")}:${String(left % 60).padStart(2, "0")}`; $("#case-timer").classList.toggle("warn", left <= 60); };
    $("#case-timer-btn").addEventListener("click", (e) => {
      if (t) { clearInterval(t); t = null; e.target.textContent = "再開"; return; }
      e.target.textContent = "一時停止";
      t = setInterval(() => { left--; disp(); if (left <= 0) { clearInterval(t); t = null; e.target.textContent = "開始"; $("#case-msg").textContent = "時間です。結論を書き切りましょう。"; } }, 1000);
    });
    $("#case-timer-reset").addEventListener("click", () => { clearInterval(t); t = null; left = 900; disp(); $("#case-timer-btn").textContent = "開始"; });

    const labels = { issue: "① 真の論点", tree: "② 構造化", hypo: "③ 初期仮説", verify: "④ 検証方法", so: "⑤ 結論と打ち手" };
    const checks = ["論点を「Yes/Noや選択」で答えられる問いにした", "イシューツリーの第1階層がMECEになっている", "仮説が具体的で、外れる可能性がある", "検証に使うデータが具体的に挙がっている", "打ち手がインパクトの大きい順に並んでいる", "30秒で話せる結論になっている"];
    $("#case-reveal").addEventListener("click", () => {
      const c = D.cases[+sel.value];
      $("#case-model").innerHTML = `<h3>模範的な考え方の一例</h3>` +
        Object.keys(labels).map((k) => `<div class="model-row"><b>${labels[k]}</b><p>${c.model[k]}</p></div>`).join("") +
        `<h3>セルフチェック</h3><ul class="checklist">${checks.map((x, i) => `<li><label><input type="checkbox" data-ck="${i}"> ${x}</label></li>`).join("")}</ul>`;
      $("#case-model").hidden = false;
    });
    $("#case-save").addEventListener("click", () => {
      const ans = {}; $$(".case-fields textarea").forEach((ta) => (ans[ta.dataset.field] = ta.value.trim()));
      if (!Object.values(ans).some(Boolean)) { $("#case-msg").textContent = "まず回答を書いてください。"; return; }
      const self = $$("#case-model input[data-ck]:checked").length;
      state.cases.push({ date: today(), case: D.cases[+sel.value].title, ans, self });
      save(); $("#case-msg").textContent = `保存しました（通算${state.cases.length}回）`;
    });
  }

  /* ---------- FERMI ---------- */
  function initFermi() {
    let idx = dayIndex() % D.fermi.length;
    const render = () => {
      const f = D.fermi[idx];
      $("#fermi-q").innerHTML = `<span class="tag">問題 ${idx + 1} / ${D.fermi.length}</span><h2>${f.q}</h2>`;
      $("#fermi-formula").value = ""; $("#fermi-answer").value = ""; $("#fermi-result").hidden = true;
    };
    const fmt = (n) => {
      if (n >= 1e12) return (n / 1e12).toLocaleString("ja-JP", { maximumFractionDigits: 1 }) + "兆";
      if (n >= 1e8) return (n / 1e8).toLocaleString("ja-JP", { maximumFractionDigits: 1 }) + "億";
      if (n >= 1e4) return (n / 1e4).toLocaleString("ja-JP", { maximumFractionDigits: 1 }) + "万";
      return n.toLocaleString("ja-JP");
    };
    const parse = (s) => {
      s = s.replace(/[,，\s]/g, "").replace(/[０-９．]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0));
      const m = s.match(/^([\d.]+)(兆|億|万)?/); if (!m) return NaN;
      return parseFloat(m[1]) * ({ 兆: 1e12, 億: 1e8, 万: 1e4 }[m[2]] || 1);
    };
    $("#fermi-check").addEventListener("click", () => {
      const f = D.fermi[idx]; const v = parse($("#fermi-answer").value);
      const box = $("#fermi-result");
      if (!(v > 0)) { box.innerHTML = `<p>数値を入力してください（「3億」「1.2万」のような表記もOK）。</p>`; box.hidden = false; return; }
      const ratio = v / f.answer; const diff = Math.abs(Math.log10(ratio));
      const verdict = diff <= 0.3 ? ["excellent", "素晴らしい！ ほぼ正解の桁です（±2倍以内）"] : diff <= 1 ? ["good", "桁は合っています（±10倍以内）。分解の精度を上げましょう"] : ["miss", "桁がずれています。前提の数字を見直しましょう"];
      state.fermi.push({ date: today(), q: f.q, v, ok: diff <= 1 }); save();
      box.innerHTML = `<p class="verdict ${verdict[0]}">${verdict[1]}</p>
        <p>あなた：<b>${fmt(v)}${f.unit}</b> ／ 目安：<b>${fmt(f.answer)}${f.unit}</b>（${ratio >= 1 ? ratio.toFixed(1) + "倍" : "1/" + (1 / ratio).toFixed(1)}）</p>
        <p class="muted">考え方の例：${f.logic}</p>
        <p class="small muted">チェック：分解の各要素は独立しているか？ 一番自信のない数字はどれで、それを変えると答えはどれくらい動くか？</p>`;
      box.hidden = false;
    });
    $("#fermi-next").addEventListener("click", () => { idx = (idx + 1) % D.fermi.length; render(); });
    $("#fermi-numbers").innerHTML = D.numbers.map(([k, v]) => `<li><span>${k}</span><b>${v}</b></li>`).join("");
    render();
  }

  /* ---------- QUIZ ---------- */
  function initQuiz() {
    const box = $("#quiz-box");
    let order, i, score, answered;
    const start = () => {
      order = D.quiz.map((_, k) => k).sort(() => Math.random() - 0.5);
      i = 0; score = 0; render();
    };
    const render = () => {
      answered = false;
      if (i >= order.length) {
        state.quiz.push({ date: today(), score }); save();
        const msg = score >= 9 ? "プロの判断軸が身についています。" : score >= 7 ? "良い水準です。間違えた問題を説明できるようにしましょう。" : "伸びしろがあります。思考の型を復習してから再挑戦しましょう。";
        box.innerHTML = `<div class="quiz-end"><p class="eyebrow">結果</p><p class="big">${score} <small>/ ${order.length}</small></p><p>${msg}</p><button class="btn" id="quiz-restart">もう一度挑戦</button></div>`;
        $("#quiz-restart").addEventListener("click", start);
        return;
      }
      const q = D.quiz[order[i]];
      box.innerHTML = `<div class="progress"><span style="width:${(i / order.length) * 100}%"></span></div>
        <p class="muted small">Q${i + 1} / ${order.length}</p><h2 class="quiz-q">${q.q}</h2>
        <div class="choices">${q.choices.map((c, k) => `<button class="choice" data-k="${k}">${c}</button>`).join("")}</div>
        <div id="quiz-why"></div>`;
    };
    box.addEventListener("click", (e) => {
      const b = e.target.closest(".choice");
      if (b && !answered) {
        answered = true;
        const q = D.quiz[order[i]]; const k = +b.dataset.k;
        $$(".choice", box).forEach((x) => { x.disabled = true; if (+x.dataset.k === q.a) x.classList.add("correct"); });
        if (k === q.a) score++; else b.classList.add("wrong");
        $("#quiz-why").innerHTML = `<div class="model"><p><b>${k === q.a ? "正解！" : "不正解"}</b> ${q.why}</p><button class="btn" id="quiz-next">${i + 1 < order.length ? "次へ" : "結果を見る"}</button></div>`;
        $("#quiz-next").focus();
      } else if (e.target.id === "quiz-next") { i++; render(); }
    });
    start();
  }

  /* ---------- HABITS & KPT ---------- */
  function initHabits() {
    const renderList = () => {
      const done = state.habits[today()] || [];
      $("#habit-list").innerHTML = D.habits.map((h, k) => `<li><label><input type="checkbox" data-h="${k}" ${done.includes(k) ? "checked" : ""}> ${h}</label></li>`).join("");
      renderHeat();
    };
    $("#habit-list").addEventListener("change", (e) => {
      const k = +e.target.dataset.h; const d = today();
      const arr = new Set(state.habits[d] || []);
      e.target.checked ? arr.add(k) : arr.delete(k);
      state.habits[d] = [...arr]; save(); renderHeat();
    });
    const renderHeat = () => {
      let html = "";
      for (let k = 27; k >= 0; k--) {
        const d = new Date(); d.setDate(d.getDate() - k);
        const key = d.toLocaleDateString("sv-SE"); const n = (state.habits[key] || []).length;
        const lv = n === 0 ? 0 : Math.ceil((n / D.habits.length) * 4);
        html += `<span class="cell l${lv}" title="${key}：${n}/${D.habits.length}"></span>`;
      }
      $("#habit-heat").innerHTML = html;
    };
    renderList();

    const renderLog = () => {
      if (!state.kpt.length) { $("#kpt-log").innerHTML = `<p class="muted">まだ記録がありません。今日の1行から始めましょう。</p>`; return; }
      $("#kpt-log").innerHTML = state.kpt.slice().reverse().slice(0, 30).map((k) => `
        <div class="kpt-entry"><p class="muted small">${fmtDate(k.date)}</p>
        <div class="kpt-cols"><div><span class="tag keep">K</span>${esc(k.keep) || "—"}</div><div><span class="tag problem">P</span>${esc(k.problem) || "—"}</div><div><span class="tag try">T</span>${esc(k.try) || "—"}</div></div></div>`).join("");
    };
    $("#kpt-form").addEventListener("submit", (e) => {
      e.preventDefault(); const f = new FormData(e.target);
      state.kpt.push({ date: today(), keep: f.get("keep").trim(), problem: f.get("problem").trim(), try: f.get("try").trim() });
      save(); e.target.reset(); renderLog();
    });
    renderLog();

    $("#export-btn").addEventListener("click", () => {
      const blob = new Blob([JSON.stringify(Object.assign({}, state, { learn: window.DojoLearn ? window.DojoLearn.data() : null }), null, 2)], { type: "application/json" });
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `consultant-dojo-${today()}.json`; a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    });
    $("#reset-btn").addEventListener("click", () => {
      if (!confirm("すべての記録を削除します。よろしいですか？")) return;
      state = { assessments: [], cases: [], fermi: [], quiz: [], habits: {}, kpt: [] }; save();
      if (window.DojoLearn) window.DojoLearn.reset(); location.reload();
    });
  }

  initAssess(); initFrameworks(); initCase(); initFermi(); initQuiz(); initHabits();
  show(location.hash.slice(1) || "home");
})();
