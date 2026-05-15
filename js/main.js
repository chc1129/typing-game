import { initState, setWords } from "./state.js";
import { render, hideResult, showGame, showResult, showStart, hideStart } from "./ui.js";
import { startTimer } from "./timer.js";
import { handleKey } from "./input.js";

const startEl = document.getElementById("start");
// スタートボタンのDOM取得
const startBtn = document.getElementById("start-btn");

// =========================
// 単語データ読み込み
// =========================
async function loadWords() {
    const response = await fetch("./data/words.json");

    // コメントをオブジェクト形式に合わせて修正する
    const wordObj = await response.json();

    return wordObj;
}


// =========================
// 初期化
// =========================
async function initGame() {
    // 単語読み込み
    const words = await loadWords();
    // stateに設定
    setWords(words);

    hideStart();  // スタート画面を非表示
    showGame();   // ゲーム表示
    hideResult(); // 結果画面を非表示


    showGame();      // ゲーム画面を表示する

    // ゲーム初期化とタイマー開始
    initState();
    render();

    startTimer(() => {
        showResult();
    });
}


// =========================
// リスタート
// =========================
function restart() {
    initGame();
}

// STARTボタンクリックでゲーム開始
startBtn.addEventListener("click", () => {
    initGame();
});

// =========================
// イベント
// =========================
document.addEventListener("keydown", (e) => {
    // スタート画面でSPACEキーを押したらゲーム開始
    if (e.key === " ") {
        // スペースキーによるページスクロールを防ぐ
        e.preventDefault();
        // startEl が表示中（display が none でない）の場合にゲームを開始
        if (startEl.style.display !== "none") {
            initGame();
            return;
        }
    }
    handleKey(e.key, restart);
});

// =========================
// 起動
// =========================
showStart();


