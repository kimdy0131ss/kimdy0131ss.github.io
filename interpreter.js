/* ======================
   button bind
====================== */
const btn = document.getElementById("execution");

document
    .getElementById("pause")
    ?.addEventListener("click", pause);

document
    .getElementById("resume")
    ?.addEventListener("click", resume);

document
    .getElementById("reset")
    ?.addEventListener("click", reset);

document
    .getElementById("oneStep")
    ?.addEventListener("click", onestep);

const slider = document.getElementById("speed");

const board = window.board;
let W = window.W;
let H = window.H;

window.stacks = window.stacks || new Map();
window.active = "";

const stacks = window.stacks;

/* ======================
   VM state
====================== */

let ip = { x: 0, y: 0 };
let dir = { x: 1, y: 0 };

window.ip = ip;
window.ipTrail = [];

let running = false;
window.running = false;

let paused = false;

function flip() {
    dir.x *= -1;
    dir.y *= -1;
}

/* ======================
   stack init
====================== */

const JONG = [
    "", "ㄱ", "ㄲ", "ㄳ", "ㄴ", "ㄵ", "ㄶ", "ㄷ", "ㄹ", "ㄺ",
    "ㄻ", "ㄼ", "ㄽ", "ㄾ", "ㄿ", "ㅀ", "ㅁ", "ㅂ", "ㅄ", "ㅅ",
    "ㅆ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"
];

for (const l of JONG) stacks.set(l, []);

/* ======================
   core ops
====================== */

function push(v) {
    const s = stacks.get(window.active);

    if (!s) return;

    s.push(v);
}

function pop() {
    const s = stacks.get(window.active);

    return s.pop();
}

function len() {
    const s = stacks.get(window.active);
    return s.length;
}

// 결과 출력

const output = document.getElementById("res_panel");

function print(text) {
    output.textContent += text;
}

// 실행
function step() {
    const ch = board[ip.y][ip.x];

    if (!ch) return false;

    window.ipTrail = (
        window.ipTrail || []
    ).concat([{ x: ip.x, y: ip.y }]).slice(-3);

    const S = ch.charCodeAt(0) - 0xAC00;

    if (S < 0 || S > 11171) {
        ip = {
            x: (ip.x + dir.x + W) % W,
            y: (ip.y + dir.y + H) % H
        };

        window.ip = ip;

        return true;
    }

    const cho = Math.floor(S / (21 * 28));
    const jung = Math.floor((S % (21 * 28)) / 28);
    const jong = S % 28;

    const c = [
        "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ",
        "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"
    ][cho];

    const j = [
        "ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅓ", "ㅔ", "ㅕ", "ㅖ", "ㅗ", "ㅘ",
        "ㅙ", "ㅚ", "ㅛ", "ㅜ", "ㅝ", "ㅞ", "ㅟ", "ㅠ", "ㅡ", "ㅢ", "ㅣ"
    ][jung];

    const g = JONG[jong];

    /* 방향 */

    switch (j) {

        case "ㅏ":
            dir = { x: 1, y: 0 };
            break;

        case "ㅓ":
            dir = { x: -1, y: 0 };
            break;

        case "ㅗ":
            dir = { x: 0, y: -1 };
            break;

        case "ㅜ":
            dir = { x: 0, y: 1 };
            break;

        case "ㅑ":
            dir = { x: 2, y: 0 };
            break;

        case "ㅕ":
            dir = { x: -2, y: 0 };
            break;

        case "ㅛ":
            dir = { x: 0, y: -2 };
            break;

        case "ㅠ":
            dir = { x: 0, y: 2 };
            break;

        case "ㅣ":
            if (dir.x === 0) break;
            else {
                flip();
                break;
            }

        case "ㅡ":
            if (dir.y === 0) break;
            else {
                flip();
                break;
            }

        case "ㅢ":
            flip();
            break;
    }

    /* 종료 */

    if (c === "ㅎ") {

        running = false;
        window.running = false;

        return false;
    }

    /* 스택 선택 */

    if (c === "ㅅ") {
        window.active = g;
    }

    if (c === "ㅆ") {
        if (len() === 0) {
            flip();
            return true;
        }

        const a = pop();
        const oldStorage = window.active;

        try {
            window.active = g;
            push(a);
        } finally {
            window.active = oldStorage;
        }
    }

    if (c === "ㅈ") {
        if (len() < 2) {
            flip();
            return true;
        }

        const a = pop();
        const b = pop();

        push(b >= a ? 1 : 0);
    }

    if (c === "ㅊ") {
        if (!len()) {
            flip();
            return true;
        }

        const a = pop();

        if (!a)
            flip();
    }

    if (c === "ㅍ") {
        if (len() < 2) {
            flip();
            return true;
        }

        const a = pop();
        const b = pop();

        push(a);
        push(b);
    }

    /* 입력 */

    if (c === "ㅂ") {

        if (g === "ㅇ") {
            push(Number(prompt("숫자")));
        }

        else if (g === "ㅎ") {
            push(prompt("문자").charCodeAt(0));
        }

        else if (g === "ㄱ" || g === "ㄴ" || g === "ㅅ") push(2);

        else if (g === "ㄷ" || g === "ㅈ" || g === "ㅋ") push(3);

        else if (g === "ㅁ" || g === "ㅂ" || g === "ㅊ" || g === "ㅌ" || g === "ㅍ" || g === "ㄲ" || g === "ㄳ" || g === "ㅆ") push(4);

        else if (g === "ㄹ" || g === "ㄵ" || g === "ㄶ") push(5);

        else if (g === "ㅄ") push(6);

        else if (g === "ㄺ" || g === "ㄽ") push(7);

        else if (g === "ㅀ") push(8);

        else if (g === "ㄻ" || g === "ㄼ" || g === "ㄾ" || g === "ㄿ") push(9);

        else if (g === "") push(0);
    }


    /* 출력 */

    if (c === "ㅁ") {
        if (len() === 0) {
            flip();
            return true;
        }

        const f = pop();

        if (g == "ㅇ") {
            print(String(f));
        }

        if (g == "ㅎ") {
            print(String.fromCharCode(f));
        }
    }

    if (c === "ㅃ") {
        if (len() === 0) {
            flip();
            return true;
        }

        else {
            const f = pop();

            push(f);
            push(f);
        }
    }

    /* 연산 */

    if (
        c === "ㄷ" ||
        c === "ㄸ" ||
        c === "ㅌ" ||
        c === "ㄴ" ||
        c === "ㄹ"
    ) {


        if (len() <= 1) flip();

        else {

            switch (c) {

                case "ㄷ": {

                    const b = pop();
                    const a = pop();

                    push(a + b);

                    break;
                }

                case "ㄸ": {

                    const b = pop();
                    const a = pop();

                    push(a * b);

                    break;
                }

                case "ㅌ": {

                    const b = pop();
                    const a = pop();

                    push(a - b);

                    break;
                }

                case "ㄴ": {

                    const b = pop();
                    const a = pop();

                    push(Math.floor(a / b));

                    break;
                }

                case "ㄹ": {

                    const b = pop();
                    const a = pop();

                    push(a % b);

                    break;
                }
            }
        }
    }

    ip = {
        x: (ip.x + dir.x + W) % W,
        y: (ip.y + dir.y + H) % H
    };

    window.ip = ip;

    return true;
}

/* ======================
   stack render
====================== */

const collapsedStacks = new Set(JONG);

function clearStacks() {

    for (const key of stacks.keys())
        stacks.set(key, []);
}

function renderStack() {

    const panel =
        document.getElementById('stack_panel');

    if (!panel) return;

    panel.innerHTML = '';

    for (const [label, stack] of stacks) {

        const row = document.createElement('div');

        row.className =
            'stack-row' +
            (
                label === window.active
                    ? ' active'
                    : ''
            );

        const header =
            document.createElement('div');

        header.className = 'stack-header';

        const collapsed =
            collapsedStacks.has(label);

        header.textContent =
            `${collapsed ? '▶' : '▼'} [${label || '""'}]`;

        header.addEventListener('click', () => {

            if (collapsedStacks.has(label))
                collapsedStacks.delete(label);

            else
                collapsedStacks.add(label);

            renderStack();
        });

        row.appendChild(header);

        if (!collapsed) {

            const body =
                document.createElement('div');

            body.className = 'stack-body';

            body.textContent =
                stack.length > 0
                    ? stack.join(', ')
                    : '(비어있음)';

            row.appendChild(body);
        }

        panel.appendChild(row);
    }
}

renderStack();

window.renderStack = renderStack;

/* ======================
   control
====================== */

function pause() {
    paused = true;
}

function resume() {
    paused = false;
}

function reset() {

    running = false;
    window.running = false;

    paused = false;

    clearStacks();

    window.active = "";

    ip = { x: 0, y: 0 };

    dir = { x: 1, y: 0 };

    window.ip = ip;

    window.ipTrail = [];

    window.render();
    window.renderStack();

    output.textContent = "";
}

function onestep() {

    if (running)
        return;

    step();

    window.render();
    window.renderStack();
}
/* ======================
   run loop
====================== */

function run() {
    const speed = slider.value;

    running = true;
    window.running = true;

    clearStacks();

    window.active = "";

    window.ipTrail = [];

    function loop() {

        if (!running)
            return;

        if (!paused) {

            step();

            window.render();
            window.renderStack();
        }

        setTimeout(() => {
            requestAnimationFrame(loop);
        }, 1);
    }

    loop();
}

btn.addEventListener("click", () => {

    ip = { x: 0, y: 0 };

    window.ipTrail = [];

    run();
});

