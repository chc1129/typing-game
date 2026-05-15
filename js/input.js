// =========================
// input.js — キー入力処理（トライ木方式）
// =========================
import { state, setWord }         from "./state.js";
import { render, showMissEffect } from "./ui.js";
import { TRIE_ROOT, KANA_PATTERNS, buildDisplay } from "./romaji.js";

// タイピング音（入力のたびに再生する）
const typingSound  = new Audio("sounds/typing.mp3");
typingSound.volume = 0.5;

// =========================
// コンボ管理
// =========================

function updateComboOnCorrect() {
    state.combo++;
    if (state.combo > state.maxCombo) state.maxCombo = state.combo;
}

function resetComboOnMiss() {
    state.combo = 0;
}

function getComboBonus(combo) {
    if (combo >= 30) return 5.0;
    if (combo >= 20) return 3.0;
    if (combo >= 10) return 2.0;
    if (combo >= 5)  return 1.5;
    return 1.0;
}

// =========================
// 単語クリア処理
// =========================
function onWordComplete() {
    state.correctCount++;
    state.score += Math.floor(500 * getComboBonus(state.combo));
    setWord();
}

// =========================
// メインのキー入力処理
// =========================
export function handleKey(key, onRestart) {

    // ゲーム終了時: Enter でリスタート
    if (state.gameState === "finished") {
        if (key === "Enter") onRestart();
        return;
    }

    // プレイ中以外は受け付けない
    if (state.gameState !== "playing") return;

    // 1文字のキー入力のみ受け付ける
    if (key.length !== 1) return;

    state.keyTypeCount++;
    const inputKey = key.toLowerCase();

    const currentCanonical = state.romajiArray[state.romajiIndex];
    if (!currentCanonical) return;

    // =========================
    // っ の特殊処理（子音重複入力方式）
    // =========================
    // っ は xtu / ltu の他に次の子音を2回入力する方式もある
    // 例) kitte: k-i で ki 完了 → t(1回目) でっ完了 → t(2回目)-e で te 完了
    if (currentCanonical === 'xtu' && state.inputBuffer === '') {
        const nextCanonical = state.romajiArray[state.romajiIndex + 1];
        if (nextCanonical) {
            const nextPatterns = KANA_PATTERNS[nextCanonical] || [];
            if (nextPatterns.some(p => p.startsWith(inputKey))) {
                // っを完了してリセット
                //    子音重複の1文字目をっに消費する
                //    2文字目（次回の同じキー入力）から次のかなの通常処理が始まる
                state.chosenPatterns[state.romajiIndex] = inputKey;
                state.romajiIndex++;
                state.trieNode    = TRIE_ROOT;
                state.inputBuffer = '';
                state.displayWord = buildDisplay(
                    state.romajiArray, state.romajiIndex, '', state.chosenPatterns
                );
                updateComboOnCorrect();
                render();
                return; // ここで終了（次回のキー入力で通常処理が始まる）
            }
        }
    }

    // =========================
    // トライ木による入力判定
    // =========================

    // currentCanonical のパターンに inputBuffer+inputKey が一致するか事前確認する
    //    これにより ne の n 入力中に xn パターン（ん）のノードに誤って入らない
    const patterns = KANA_PATTERNS[currentCanonical] || [currentCanonical];
    const newBuf   = state.inputBuffer + inputKey;
    if (!patterns.some(p => p.startsWith(newBuf))) {
        // パターンに一致しない → ミス処理
        // inputBuffer と trieNode はリセットしない（バッファ保持方式）
        // ミスしたキーを無視して表示はそのまま維持する
        state.missCount++;
        resetComboOnMiss();
        showMissEffect();
        render();
        return;
    }

    // トライ木ノードを1文字進める
    const nextNode = state.trieNode?.children?.[inputKey];
    if (!nextNode) {
        // ノードなし → ミス処理
        // inputBuffer と trieNode はリセットしない（バッファ保持方式）
        // ミスしたキーを無視して表示はそのまま維持する
        state.missCount++;
        resetComboOnMiss();
        showMissEffect();
        render();
        return;
    }

    // 正解処理: ノードを進めてバッファを更新する
    state.trieNode     = nextNode;
    state.inputBuffer += inputKey;

    // 表示文字列をリアルタイム更新する
    state.displayWord = buildDisplay(
        state.romajiArray, state.romajiIndex,
        state.inputBuffer, state.chosenPatterns
    );

    // タイピング音を再生する
    typingSound.currentTime = 0;
    typingSound.play().catch(() => {});

    // =========================
    // ローマ字完了判定
    // =========================
    // nextNode.complete が currentCanonical と一致 → このかなの入力が完了
    if (nextNode.complete === currentCanonical) {
        state.chosenPatterns[state.romajiIndex] = state.inputBuffer;
        state.romajiIndex++;
        state.inputBuffer = '';
        state.trieNode    = TRIE_ROOT; // ルートに戻る

        updateComboOnCorrect();

        if (state.romajiIndex >= state.romajiArray.length) {
            // 全ローマ字完了 → 単語クリア
            onWordComplete();
        } else {
            // 次のかなの初期表示を更新する
            state.displayWord = buildDisplay(
                state.romajiArray, state.romajiIndex, '', state.chosenPatterns
            );
        }
    }

    render();
}
