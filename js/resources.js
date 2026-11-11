/*
 * 学習リソース：外部の学習サイトへのリンク集
 * 内容は各サイトが提供するもの。URLは 2026年11月 に検索で掲載を確認。
 * lang: "ja" | "en"   cost: "無料" | "一部有料" | null（公式で確認）
 */
window.DOJO_RESOURCES = [
  {
    id: "logic", title: "論理思考・クリティカルシンキング",
    desc: "MECE、ロジックツリー、ピラミッド構造など、考える力の土台を学ぶ。",
    items: [
      { id: "globis-logic-tag", title: "ロジカル・シンキングを記事で学ぶ", site: "GLOBIS学び放題×知見録", url: "https://globis.jp/tags/1461/", lang: "ja", cost: "無料",
        use: "グロービス教員による解説記事の一覧。連載「ロジカルシンキングの基本」(全10回)から順に読むのがおすすめ。" },
      { id: "globis-ct-path", title: "【実践】クリティカル・シンキング（論理思考）", site: "GLOBIS学び放題×知見録", url: "https://globis.jp/learning-paths/92fed069/", lang: "ja", cost: null,
        use: "クリティカル・シンキングを体系立てて学べる学習パス。" },
      { id: "glossary-mece", title: "MBA用語集「MECE」", site: "グロービス経営大学院", url: "https://mba.globis.ac.jp/about_mba/glossary/detail-11654.html", lang: "ja", cost: "無料",
        use: "「モレなくダブりなく」の定義と使いどころを短く確認できる。" },
      { id: "glossary-logictree", title: "MBA用語集「ロジック・ツリー」", site: "グロービス経営大学院", url: "https://mba.globis.ac.jp/about_mba/glossary/detail-12056.html", lang: "ja", cost: "無料",
        use: "問題の所在の絞り込みや解決策の検討に使う分解の型。" },
      { id: "schoo-logic", title: "ロジカルシンキング入門", site: "Schoo（スクー）", url: "https://schoo.jp/class/2926", lang: "ja", cost: null,
        use: "動画授業。言葉は知っているが具体的なイメージが湧かない人向けの入門。" },
      { id: "coursera-ibm", title: "Solving Problems with Creative and Critical Thinking（IBM）", site: "Coursera", url: "https://www.coursera.org/learn/solving-problems-with-creative-and-critical-thinking", lang: "en", cost: null,
        use: "根本原因を見つける問題解決の手順を学ぶ初心者向けコース。" }
    ]
  },
  {
    id: "issue", title: "論点・仮説思考",
    desc: "解くべき問いを見極め、仮説から始めて速く答えに近づく。",
    items: [
      { id: "glossary-issue", title: "MBA用語集「イシュー」", site: "グロービス経営大学院", url: "https://mba.globis.ac.jp/about_mba/glossary/detail-11716.html", lang: "ja", cost: "無料",
        use: "「何を考え、論じるべきか」の定義。論点を誤るとどれだけ精緻に考えても意味がない理由を確認。" },
      { id: "glossary-hypo", title: "MBA用語集「仮説思考」", site: "グロービス経営大学院", url: "https://mba.globis.ac.jp/about_mba/glossary/detail-12102.html", lang: "ja", cost: "無料",
        use: "仮説思考の定義と関連用語。" },
      { id: "globis-day5", title: "答えを出せる問いなのか？ ロジカルシンキングの基本を学ぶ＜DAY5＞", site: "GLOBIS学び放題×知見録", url: "https://globis.jp/article/7032/", lang: "ja", cost: "無料",
        use: "良い問いの立て方を扱う連載回。" },
      { id: "globis-hypo-2233", title: "仮説とは：コンサルの定番思考法で仕事のスピードアップを", site: "GLOBIS学び放題×知見録", url: "https://globis.jp/article/2233/", lang: "ja", cost: "無料",
        use: "仮説と検証をセットで考える基本。入門として最初に読む一本。" },
      { id: "globis-hypo-new", title: "仮説思考で変わる意思決定力", site: "GLOBIS学び放題×知見録", url: "https://globis.jp/article/1c2ke7guz3d/", lang: "ja", cost: "無料",
        use: "良い仮説の条件と検証の手順を実務目線で解説。" },
      { id: "glossary-zerobase", title: "MBA用語集「ゼロベース思考」", site: "グロービス経営大学院", url: "https://mba.globis.ac.jp/about_mba/glossary/detail-11848.html", lang: "ja", cost: "無料",
        use: "前提を外して考える思考法の定義。" }
    ]
  },
  {
    id: "case", title: "ケース・問題解決の実践（ファーム公式）",
    desc: "戦略コンサルティングファームが公開している公式のケース練習教材。",
    items: [
      { id: "mck-interview", title: "Interviewing at McKinsey（サンプルケース）", site: "McKinsey & Company", url: "https://www.mckinsey.com/careers/interviewing", lang: "en", cost: "無料",
        use: "Beautify、Electro-Light、Talbot Trucks、Diconsa などの公式サンプルケースに、考え方と解答例付きで取り組める。" },
      { id: "bcg-case", title: "Case Interview Preparation", site: "BCG", url: "https://careers.bcg.com/case-interview-preparation", lang: "en", cost: "無料",
        use: "BCGのケース面接の進め方と心構え、準備度チェック。" },
      { id: "bain-case", title: "ケース面接対策（日本語）", site: "Bain & Company", url: "https://www.bain.com/ja/careers/hiring-process/case-interview/", lang: "ja", cost: "無料",
        use: "ベインのケース面接の形式と準備用の教材。日本語で読める。" }
    ]
  },
  {
    id: "number", title: "定量分析・数字感覚",
    desc: "フェルミ推定の型と、推定の土台になる公的統計に触れる。",
    items: [
      { id: "glossary-fermi", title: "MBA用語集「フェルミ推定」", site: "グロービス経営大学院", url: "https://mba.globis.ac.jp/about_mba/glossary/detail-20808.html", lang: "ja", cost: "無料",
        use: "フェルミ推定の定義と、潜在市場規模の予測などビジネスでの使い方。" },
      { id: "stat-nihon", title: "日本の統計", site: "総務省統計局", url: "https://www.stat.go.jp/data/nihon/index1.html", lang: "ja", cost: "無料",
        use: "人口・経済・社会など基本統計をまとめた総合統計書。フェルミ推定の基礎数字はここで確認する。" },
      { id: "stat-jinsui", title: "人口推計（最新）", site: "総務省統計局", url: "https://www.stat.go.jp/data/jinsui/new.html", lang: "ja", cost: "無料",
        use: "毎月更新される日本の総人口。最も使う基礎数字を最新値で押さえる。" },
      { id: "gacco-ds", title: "社会人のためのデータサイエンス入門", site: "gacco（総務省統計局）", url: "https://gacco.org/stat-japan/", lang: "ja", cost: "無料",
        use: "統計学の基礎と統計データの見方を学ぶ無料オンライン講座。開講時期が決まっているので募集を確認。" },
      { id: "naruhodo", title: "なるほど統計学園", site: "総務省統計局", url: "https://www.stat.go.jp/naruhodo/", lang: "ja", cost: "無料",
        use: "グラフの作り方や統計の基本を学べる学習サイト（学生向けだが基礎の復習に使える）。" }
    ]
  },
  {
    id: "doc", title: "資料作成・プレゼンテーション",
    desc: "メッセージの立て方、論理の組み立て方、伝わるグラフを学ぶ。",
    items: [
      { id: "glossary-pyramid", title: "MBA用語集「ピラミッド構造」", site: "グロービス経営大学院", url: "https://mba.globis.ac.jp/about_mba/glossary/detail-11937.html", lang: "ja", cost: "無料",
        use: "バーバラ・ミントが体系化した論理構造。ロジック・ツリーとの違いも確認できる。" },
      { id: "glossary-sowhat", title: "MBA用語集「So what?」", site: "グロービス経営大学院", url: "https://mba.globis.ac.jp/about_mba/glossary/detail-11682.html", lang: "ja", cost: "無料",
        use: "情報から「言えること（メッセージ）」を引き出す問いかけ。" },
      { id: "glossary-message", title: "MBA用語集「メッセージ」", site: "グロービス経営大学院", url: "https://mba.globis.ac.jp/about_mba/glossary/detail-12028.html", lang: "ja", cost: "無料",
        use: "見出しとメッセージの違い。スライドタイトルを書く前に読む。" },
      { id: "globis-presen", title: "プレゼンテーション入門――聴き手を起点に考える", site: "GLOBIS学び放題×知見録", url: "https://globis.jp/article/4xh79sprq1gl/", lang: "ja", cost: "無料",
        use: "資料づくりの前に聴き手を考える、プレゼンの基本。" },
      { id: "swd-blog", title: "storytelling with data（ブログ）", site: "storytelling with data", url: "https://www.storytellingwithdata.com/blog", lang: "en", cost: "無料",
        use: "データを伝わるグラフとストーリーにする実例が豊富。" },
      { id: "swd-bars", title: "when bars win—and when lines do", site: "storytelling with data", url: "https://www.storytellingwithdata.com/blog/when-bars-winand-when-lines-do", lang: "en", cost: "無料",
        use: "棒グラフと折れ線グラフの使い分け。" }
    ]
  },
  {
    id: "insight", title: "コミュニケーション・経営の最新知見",
    desc: "伝える力を磨き、クライアントの経営課題を語れる知識を蓄える。",
    items: [
      { id: "globis-comm", title: "コミュニケーションを記事で学ぶ", site: "GLOBIS学び放題×知見録", url: "https://globis.jp/tags/102/", lang: "ja", cost: "無料",
        use: "伝え方・聞き方・関係構築に関する記事の一覧。" },
      { id: "globis-learn", title: "「体系的に学ぶ」カテゴリ一覧", site: "GLOBIS学び放題×知見録", url: "https://globis.jp/learn-content/", lang: "ja", cost: null,
        use: "経営の各分野をテーマ別に学べる入口。" },
      { id: "glossary-3c", title: "MBA用語集「3C」", site: "グロービス経営大学院", url: "https://mba.globis.ac.jp/about_mba/glossary/detail-12524.html", lang: "ja", cost: "無料",
        use: "市場・顧客、競合、自社の3視点で事業環境を分析する型。" },
      { id: "glossary-vc", title: "MBA用語集「バリューチェーン」", site: "グロービス経営大学院", url: "https://mba.globis.ac.jp/about_mba/glossary/detail-11918.html", lang: "ja", cost: "無料",
        use: "どの機能で付加価値が生まれているかを分析する型。" },
      { id: "mck-jp", title: "マッキンゼー 知見（日本語）", site: "McKinsey & Company", url: "https://www.mckinsey.com/jp/our-insights", lang: "ja", cost: "無料",
        use: "日本企業の経営課題・業界動向に関するレポート。週1本読み、So Whatを1つ書く。" },
      { id: "dhbr", title: "DIAMOND ハーバード・ビジネス・レビュー", site: "ダイヤモンド社", url: "https://dhbr.diamond.jp/", lang: "ja", cost: "一部有料",
        use: "HBR日本版。経営・リーダーシップの論文と記事。" }
    ]
  }
];
