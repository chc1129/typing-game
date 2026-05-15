import { state } from "./state.js";
import { render } from "./ui.js";

let timerId = null;

// =========================
// タイマー開始
// =========================
export function startTimer(onFinish) {
    stopTimer();

    timerId = setInterval(() => {
        if (state.gameState !== "playing") return;

        state.time--;

        if (state.time <= 0) {
            state.gameState = "finished";
            stopTimer();
            onFinish();
        }

        render();
    }, 1000);

}


// 停止
export function stopTimer() {
    if (timerId) {
        clearInterval(timerId);
    }
}

