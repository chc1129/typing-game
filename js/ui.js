// バージョン確認用ログ（置き換え確認後に削除してよい）
console.log('[ui.js] トライ木版 v2 が読み込まれました');

import { state, GAME_TIME } from "./state.js";

// 結果音（結果画面表示から0.5秒後に再生する）
const resultSound  = new Audio("sounds/result.mp3");
resultSound.volume = 0.3;

// =========================
// DOM取得
// =========================
const startEl = document.getElementById("start");

const readingEl  = document.getElementById("reading");
const wordEl     = document.getElementById("word");
const missEl     = document.getElementById("miss");
const comboEl    = document.getElementById("combo");
const timerBarEl = document.getElementById("timer-bar");

const gameEl          = document.getElementById("game");
const resultEl        = document.getElementById("result");
const resultCorrectEl = document.getElementById("result-correct");
const resultMissEl    = document.getElementById("result-miss");
const resultComboEl   = document.getElementById("result-combo");
const resultSpeedEl   = document.getElementById("result-speed");

const cbScoreEl = document.getElementById("cb-score");
const cbMissEl  = document.getElementById("cb-miss");
const cbComboEl = document.getElementById("cb-combo");
const cbSpeedEl = document.getElementById("cb-speed");

// コースター img 要素を取得する
const coasterEl = document.getElementById("coaster");


// =========================
// 描画処理
// =========================

// 単語の色分け描画
// displayWord（入力済み + 入力中バッファ + 未入力を含む全体文字列）を
// 入力済み・入力中・未入力の3色に分けて表示する
// =========================
// 単語の色分け描画
// =========================
// displayWord を入力済み(オレンジ)・入力中・未入力(グレー)の3色で表示する
// 長い単語は CSS の word-break で自動折り返しする
function renderCurrentWord() {
    wordEl.innerHTML = "";

    // displayWord は buildDisplay() で生成された全体表示文字列
    const display = state.displayWord;

    // displayWord が空の場合は何も表示しない
    if (!display) return;

    // 入力済み文字数を計算する
    const completedLen = Object.values(state.chosenPatterns)
        .reduce((sum, p) => sum + p.length, 0);
    const typedLen = completedLen + state.inputBuffer.length;

    // 1文字ずつ span を生成して色を付ける
    // CSS の word-break: break-all により長い単語は自動で折り返される
    display.split("").forEach((char, index) => {
        const span = document.createElement("span");
        span.textContent = char;

        if (index < typedLen) {
            span.classList.add("correct");          // 入力済み → オレンジ
        } else if (index === typedLen) {
            span.classList.add("current-position"); // 次の文字 → グレー下線
        } else {
            span.classList.add("pending");          // 未入力 → グレー
        }
        wordEl.appendChild(span);
    });
}


// =========================
// 画面切替
// =========================

// スタート画面を表示する
export function showStart() {
    startEl.style.display  = "flex";
    gameEl.style.display   = "none";
    resultEl.style.display = "none";
}

// スタート画面を非表示にする
export function hideStart() {
    startEl.style.display = "none";
}

// ゲーム画面を表示する
export function showGame() {
    gameEl.style.display   = "flex";
    resultEl.style.display = "none";
}

// 結果画面を非表示にする（リスタート用）
export function hideResult() {
    resultEl.style.display = "none";
}


// =========================
// 全体更新
// =========================
export function render() {
    renderCurrentWord();

    readingEl.textContent = state.currentReading;
    missEl.textContent    = state.missCount;
    comboEl.textContent   = String(state.combo).padStart(3, "0");

    // タイマーバーの幅と色を更新する
    const timePercent = (state.time / GAME_TIME) * 100;
    timerBarEl.style.width = `${timePercent}%`;

    if (timePercent > 50) {
        timerBarEl.style.backgroundColor = "#ff9800"; // オレンジ（余裕あり）
    } else if (timePercent > 25) {
        timerBarEl.style.backgroundColor = "#ff5722"; // 濃いオレンジ（注意）
    } else {
        timerBarEl.style.backgroundColor = "#f44336"; // 赤（残りわずか）
    }
}


// =========================
// ミスエフェクト
// =========================
export function showMissEffect() {
    wordEl.classList.add("miss-effect");
    setTimeout(() => {
        wordEl.classList.remove("miss-effect");
    }, 150);
}


// =========================
// コースターのスタンプアニメーション
// =========================
function stampCoaster() {
    if (!coasterEl) return;

    // アニメーションをリセットしてから再適用する
    coasterEl.classList.remove("stamp-active");

    // rAF を2重にしてブラウザの描画を確実に待つ
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            coasterEl.classList.add("stamp-active");
        });
    });
}

// コースター画像を読み込んでアニメーションを開始する
// triggered フラグで onload と complete チェックの重複を防ぎ
// アニメーションが2回動作しないようにする
function loadCoasterAndStamp(src, delay) {
    if (!coasterEl) return;

    coasterEl.classList.remove("stamp-active");
    coasterEl.style.transform = "translate(-50%, -50%) rotate(-25deg) scale(0)";
    coasterEl.style.opacity   = "0";

    // triggered フラグ: onload と complete の両方が発火しても
    // stampCoaster() が1回だけ実行されるようにする
    let triggered = false;

    function startAnim() {
        if (triggered) return; // 2回目以降の呼び出しをブロックする
        triggered = true;
        coasterEl.style.transform = "";
        coasterEl.style.opacity   = "";
        setTimeout(() => { stampCoaster(); }, delay);
    }

    coasterEl.onload  = () => { startAnim(); };
    coasterEl.onerror = () => {
        console.warn("コースター画像のロードに失敗しました:", src);
    };

    coasterEl.src = src;

    // キャッシュ済みの場合は onload が発火しないため
    // complete と naturalWidth で確認して即座に実行する
    if (coasterEl.complete && coasterEl.naturalWidth > 0) {
        startAnim();
    }
}


// =========================
// 結果画面表示
// =========================
export function showResult() {
    resultCorrectEl.textContent = String(state.score).padStart(9, "0");
    resultMissEl.textContent    = state.missCount;
    resultComboEl.textContent   = state.maxCombo;

    const speed = (state.keyTypeCount / GAME_TIME).toFixed(1);
    resultSpeedEl.textContent   = speed;

    // チェックをすべてリセットする
    [cbScoreEl, cbMissEl, cbComboEl, cbSpeedEl].forEach(el => {
        el.classList.remove("checked");
    });

    // スコアに応じてコースター画像を決定する
    let coasterSrc;
    if (state.score >= 21000) {
        coasterSrc = "images/coaster_03.png"; // エクセレント
    } else if (state.score >= 10000) {
        coasterSrc = "images/coaster_02.png"; // グッド
    } else {
        coasterSrc = "images/coaster_01.png"; // ノーマル
    }

    // 表示切替
    gameEl.style.display   = "none";
    resultEl.style.display = "flex";

    // 結果音を1.45秒遅らせて再生する
    setTimeout(() => {
        resultSound.currentTime = 0;
        resultSound.play().catch(() => {});
    }, 1450);

    // 条件を満たす項目に時間差でチェックを描画する
    const checks = [
        { el: cbScoreEl, condition: state.score         >= 5000 },
        { el: cbMissEl,  condition: state.missCount     <= 5    },
        { el: cbComboEl, condition: state.maxCombo      >= 10   },
        { el: cbSpeedEl, condition: parseFloat(speed)   >= 3.0  },
    ];

    checks.forEach((item, index) => {
        if (item.condition) {
            setTimeout(() => {
                item.el.classList.add("checked");
            }, 400 + index * 350);
        }
    });

    // 全チェック完了後（1800ms）にコースターをスタンプする
    loadCoasterAndStamp(coasterSrc, 1800);
}
