// === Facebook Messenger 極致 + 可自訂提前毫秒（補償網頁延遲）===
(function () {
    console.log("超精準提前發送腳本已啟動！");

    // ═══════════════════ 這裡改你的設定 ═══════════════════
    const TARGET_HOUR       = 2;     // 目標小時（24小時制）
    const TARGET_MINUTE     = 20;    // 目標分鐘
    const ADVANCE_MS        = 10;   // ← 提前多少毫秒發送（建議 150～250 之間自己測試最準）
    // ═══════════════════════════════════════════════════

    let scheduled = false;

    function sendExactly() {
        const input = document.querySelector('div[aria-label="Message"][contenteditable="true"]') ||
                      document.querySelector('div[role="textbox"][contenteditable="true"]');

        if (!input) {
            console.error("找不到輸入框！請確認已在正確的 Messenger 聊天視窗");
            return false;
        }

        // 完整模擬 Enter 三連發（最穩）
        ['keydown', 'keypress', 'keyup'].forEach(type => {
            const event = new KeyboardEvent(type, {
                key: 'Enter', code: 'Enter', keyCode: 13, which: 13,
                bubbles: true, cancelable: true
            });
            input.dispatchEvent(event);
        });

        const now = new Date();
        console.log(`已提前 ${ADVANCE_MS}ms 送出！實際發送時間：${now.toLocaleTimeString()}.${String(now.getMilliseconds()).padStart(3,'0')}`);
        return true;
    }

    function scheduleNext() {
        if (scheduled) return;
        scheduled = true;

        const now = new Date();
        let target = new Date(now.getFullYear(), now.getMonth(), now.getDate(),
                              TARGET_HOUR, TARGET_MINUTE, 0, 0);

        // 若已超過目標時間 → 排到明天
        if (target <= now) {
            target.setDate(target.getDate() + 1);
        }

        // 減去提前量
        const triggerTime = target.getTime() - ADVANCE_MS;

        const msUntilTrigger = triggerTime - Date.now();

        console.log(`目標顯示時間：${target.toLocaleString().split(' ')[1].slice(0,8)}.000`);
        console.log(`實際發送時間：提前 ${ADVANCE_MS}ms → ${new Date(triggerTime).toLocaleString().split(' ')[1].slice(0,8)}.${String(target.getMilliseconds()).padStart(3,'0')}`);
        console.log(`距離發送還有 ${Math.round(msUntilTrigger/1000)} 秒`);

        // 粗略計時到前 2 秒
        setTimeout(() => {
            const preciseCheck = () => {
                const now = Date.now();
                const timeToTrigger = triggerTime - now;

                if (timeToTrigger <= 0) {
                    sendExactly();
                    scheduled = false;
                    scheduleNext();  // 自動排明天
                } else {
                    // 剩不到 50ms 時用最高頻率檢查
                    if (timeToTrigger < 50) {
                        requestAnimationFrame(preciseCheck);
                    } else {
                        setTimeout(preciseCheck, 1);
                    }
                }
            };
            preciseCheck();
        }, Math.max(0, msUntilTrigger - 2000));
    }

    // 啟動
    scheduleNext();

    // 保險 interval
    setInterval(() => {
        const n = new Date();
        const todayTarget = new Date(n.getFullYear(), n.getMonth(), n.getDate(), TARGET_HOUR, TARGET_MINUTE, 0, 0);
        const triggerTime = todayTarget.getTime() - ADVANCE_MS;

        if (Math.abs(Date.now() - triggerTime) < 100) {  // ±100ms 內都補發
            sendExactly();
        }
    }, 50);

})();