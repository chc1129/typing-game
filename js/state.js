// バージョン確認用ログ（置き換え確認後に削除してよい）
console.log('[state.js] トライ木版 v2 が読み込まれました');

// =========================
// state.js — ゲーム状態管理
// =========================
import { TRIE_ROOT, splitRomaji, buildDisplay } from "./romaji.js";

// 定数
export const GAME_TIME = 30;

// =========================
// 状態オブジェクト（全体で共有）
// =========================
export const state = {
    words: {},           // 単語データ { '読み方': 'romaji' }

    currentWord: "",     // 表示する単語（日本語）
    currentReading: "",  // 読み方（日本語表示用）

    // ── トライ木方式の入力管理 ──
    romajiArray:    [],  // ローマ字を分解した配列 例) ['syo', 'si', 'n', 'sya']
    romajiIndex:    0,   // 現在入力中のローマ字のインデックス
    inputBuffer:    "",  // 現在入力中の文字バッファ 例) 'sh'（sho入力途中）
    chosenPatterns: {},  // 確定済みパターン 例) { 0:'syo', 1:'shi' }
    trieNode:       null,// 現在のトライ木ノード（input.jsが1文字ずつ辿る）
    displayWord:    "",  // 画面に表示する文字列（入力に応じてリアルタイム更新）

    correctCount: 0,     // 正解した単語数
    missCount:    0,     // ミス回数
    combo:        0,     // 現在のコンボ数
    maxCombo:     0,     // 最大コンボ数
    score:        0,     // 合計スコア
    keyTypeCount: 0,     // キータイプ数（SPEED計算用）

    time:      GAME_TIME,
    gameState: "ready"   // ready / playing / finished
};


// =========================
// 状態操作
// =========================

// 単語データをセットする
export function setWords(wordObj) {
    state.words = wordObj;
}

// =========================
// 単語設定
// =========================
// ランダムに1単語を選び、トライ木方式の入力管理プロパティを初期化する
export function setWord() {
    if (Object.keys(state.words).length === 0) return;

    // ランダムに1つの読み方を選ぶ
    const readings      = Object.keys(state.words);
    const randomReading = readings[Math.floor(Math.random() * readings.length)];

    // 選んだ読み方と対応するローマ字を取得する
    state.currentWord    = state.words[randomReading]; // ローマ字文字列 'syoshinsya'
    state.currentReading = randomReading;              // 日本語表示用 '初心者'

    // ローマ字文字列をローマ字配列に分解する
    // 例) 'syoshinsya' → ['syo', 'si', 'n', 'sya']
    state.romajiArray    = splitRomaji(state.currentWord);

    // 入力管理をリセットする
    state.romajiIndex    = 0;        // 最初のローマ字から開始する
    state.inputBuffer    = "";       // バッファをクリアする
    state.chosenPatterns = {};       // 確定済みパターンをクリアする
    state.trieNode       = TRIE_ROOT;// トライ木のルートノードから開始する

    // 初期表示文字列を生成する（すべて標準パターンで表示）
    state.displayWord    = buildDisplay(state.romajiArray, 0, "", {});
}

// =========================
// 初期化
// =========================
export function initState() {
    state.time         = GAME_TIME;
    state.missCount    = 0;
    state.correctCount = 0;
    state.combo        = 0;
    state.maxCombo     = 0;
    state.score        = 0;
    state.keyTypeCount = 0;
    state.gameState    = "playing";

    // トライ木方式の入力管理をリセットする
    // setWord() でも初期化されるが
    // リスタート時に前回の値が一瞬残るリスクを防ぐために明示的にリセットする
    state.romajiArray    = [];
    state.romajiIndex    = 0;
    state.inputBuffer    = "";
    state.chosenPatterns = {};
    state.trieNode       = TRIE_ROOT;
    state.displayWord    = ""; // 前回の displayWord が残らないようにリセットする

    setWord();
}
