/* 学習コース */
(function () {
  "use strict";
  const C = window.DOJO_COURSE;
  const $ = (s, el = document) => el.querySelector(s);
  const KEY = "consultant-dojo-learn-v1";
  let mem = {};
  let prog;
  try { prog = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { prog = mem; }
  prog = Object.assign({ done: {}, answers: {}, last: null }, prog);
  const save = () => { mem = prog; try { localStorage.setItem(KEY, JSON.stringify(prog)); } catch (e) { /* ignore */ } };

  const all = C.flatMap((m) => m.lessons.map((l) => Object.assign({ module: m }, l)));
  const find = (id) => all.find((l) => l.id === id);
  const doneCount = (m) => (m ? m.lessons : all).filter((l) => prog.done[l.id]).length;
  const nextLesson = () => all.find((l) => !prog.done[l.id]) || null;

  // ホーム等から使う
  window.DojoLearn = {
    summary() { return { done: doneCount(), total: all.length, next: nextLesson() }; },
    doneDates() { return Object.values(prog.done); },
    data() { return prog; },
    reset() { prog = { done: {}, answers: {}, last: null }; save(); }
  };

  function bar(n, total) { return `<div class="progress"><span style="width:${total ? (n / total) * 100 : 0}%"></span></div>`; }

  function renderIndex() {
    const n = doneCount(), next = nextLesson();
    $("#learn-root").innerHTML = `
      <h1 class="page-title">学習コース</h1>
      <p class="lead">6つのモジュール・${all.length}レッスンで、コンサルタントの基礎を体系的に学びます。1レッスン5〜7分。読む → 確認問題 → 今日の実践、の順で進めましょう。</p>
      <div class="card course-summary">
        <div class="card-head"><h2>全体の進捗</h2><span class="muted">${n} / ${all.length} レッスン完了</span></div>
        ${bar(n, all.length)}
        ${next ? `<a class="btn" href="#learn/${next.id}">${n ? "続きから学ぶ" : "最初のレッスンを始める"}：${next.title}</a>` : `<p><b>全レッスン修了です！</b> 実践タブで繰り返し使い、型を体に染み込ませましょう。</p>`}
      </div>
      <div class="module-grid">
        ${C.map((m, mi) => {
          const d = doneCount(m);
          return `<article class="card module">
            <p class="eyebrow">MODULE ${mi + 1}</p>
            <h2>${m.title}</h2>
            <p class="muted small">${m.desc}</p>
            ${bar(d, m.lessons.length)}
            <ol class="lesson-list">
              ${m.lessons.map((l) => `<li class="${prog.done[l.id] ? "done" : ""}"><a href="#learn/${l.id}"><span class="check" aria-hidden="true">${prog.done[l.id] ? "✓" : ""}</span><span>${l.title}</span></a><span class="pill">${l.min}分</span></li>`).join("")}
            </ol>
          </article>`;
        }).join("")}
      </div>`;
  }

  function renderLesson(id) {
    const l = find(id);
    if (!l) { renderIndex(); return; }
    prog.last = id; save();
    const m = l.module, idx = all.indexOf(l), prev = all[idx - 1], next = all[idx + 1];
    const li = m.lessons.findIndex((x) => x.id === l.id) + 1;
    const answered = prog.answers[id];
    $("#learn-root").innerHTML = `
      <nav class="crumbs small"><a href="#learn">学習コース</a> / ${m.title}</nav>
      <article class="card lesson">
        <p class="eyebrow">MODULE ${C.indexOf(m) + 1} ・ LESSON ${li} / ${m.lessons.length} ・ ${l.min}分</p>
        <h1 class="lesson-title">${l.title}</h1>
        ${l.body.map((p) => `<p>${p}</p>`).join("")}
        <div class="keypoints"><h3>ポイント</h3><ul>${l.points.map((p) => `<li>${p}</li>`).join("")}</ul></div>
        <div class="example"><h3>${l.example.title}</h3><p>${l.example.text}</p></div>
        <section class="lesson-check">
          <h3>確認問題</h3>
          <p class="quiz-q">${l.check.q}</p>
          <div class="choices">${l.check.choices.map((c, k) => `<button class="choice" data-k="${k}">${c}</button>`).join("")}</div>
          <div id="lesson-why"></div>
        </section>
        <div class="action"><h3>今日の実践</h3><p>${l.action}</p></div>
        <div class="row lesson-foot">
          <button class="btn" id="lesson-done">${prog.done[id] ? "完了済み ✓（取り消す）" : "このレッスンを完了にする"}</button>
          <span class="spacer"></span>
          ${prev ? `<a class="btn ghost" href="#learn/${prev.id}">← 前へ</a>` : ""}
          ${next ? `<a class="btn ghost" href="#learn/${next.id}">次へ →</a>` : `<a class="btn ghost" href="#learn">一覧へ</a>`}
        </div>
      </article>`;

    const showAnswer = (k) => {
      document.querySelectorAll("#learn-root .choice").forEach((b) => {
        b.disabled = true;
        if (+b.dataset.k === l.check.a) b.classList.add("correct");
        else if (+b.dataset.k === k) b.classList.add("wrong");
      });
      $("#lesson-why").innerHTML = `<div class="model"><p><b>${k === l.check.a ? "正解！" : "不正解"}</b> ${l.check.why}</p></div>`;
    };
    if (answered !== undefined) showAnswer(answered);
    $(".lesson-check .choices").addEventListener("click", (e) => {
      const b = e.target.closest(".choice"); if (!b || b.disabled) return;
      const k = +b.dataset.k; prog.answers[id] = k;
      if (k === l.check.a && !prog.done[id]) prog.done[id] = new Date().toLocaleDateString("sv-SE");
      save(); showAnswer(k);
      $("#lesson-done").textContent = prog.done[id] ? "完了済み ✓（取り消す）" : "このレッスンを完了にする";
    });
    $("#lesson-done").addEventListener("click", () => {
      if (prog.done[id]) delete prog.done[id]; else prog.done[id] = new Date().toLocaleDateString("sv-SE");
      save();
      if (prog.done[id] && next) location.hash = `#learn/${next.id}`; else renderLesson(id);
    });
  }

  function route() {
    const h = location.hash.slice(1);
    if (!h.startsWith("learn")) return;
    const id = h.split("/")[1];
    id ? renderLesson(id) : renderIndex();
  }
  window.addEventListener("hashchange", route);
  route();
})();
