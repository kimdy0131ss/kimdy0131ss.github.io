const editor = document.getElementById('editor');
const hidden_input = document.getElementById('hidden_input');

window.W = 20;
window.H = 10;

window.board = Array.from(
    { length: H },
    () => Array(W).fill(' ')
);

let cx = 0;
let cy = 0;

let composing = false;
let compositionText = '';

let selecting = false;

let selectStartX = 0;
let selectStartY = 0;

let selectEndX = 0;
let selectEndY = 0;

/* ======================
    셀 추가
====================== */

function expandWidth() {

    W++;

    for (let y = 0; y < H; y++)
        board[y].push(' ');
}

function expandHeight() {

    H++;

    board.push(
        Array(W).fill(' ')
    );
}

/* ======================
   이동
====================== */

function moveRight() {

    if (cx < W - 1) {
        cx++;
        return;
    }

    cx = 0;

    if (cy < H - 1) {
        cy++;
        return;
    }

    expandHeight();
    cy++;
}

function moveLeft() {
    if (cx > 0) cx--;
    else if (cy > 0) {
        cy--;
        cx = W - 1;
    }
}

function moveUp() {
    if (cy > 0) cy--;
}

function moveDown() {

    if (cy < H - 1) {

        cy++;
        return;
    }

    expandHeight();

    cy++;
}
/* ======================
   IP trail index
====================== */

function getTrailIndex(x, y) {
    const t = window.ipTrail || [];

    for (let i = 0; i < t.length; i++) {
        const p = t[t.length - 1 - i];

        if (p.x === x && p.y === y)
            return i;
    }

    return -1;
}

/* ======================
   drag
====================== */

function isSelected(x, y) {

    const minX = Math.min(selectStartX, selectEndX);
    const maxX = Math.max(selectStartX, selectEndX);

    const minY = Math.min(selectStartY, selectEndY);
    const maxY = Math.max(selectStartY, selectEndY);

    return (
        x >= minX &&
        x <= maxX &&
        y >= minY &&
        y <= maxY
    );
}

/* ======================
   render
====================== */

function render() {
    editor.style.gridTemplateColumns =
    `repeat(${W}, 40px)`;

    editor.innerHTML = '';

    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {

            const cell = document.createElement('div');
            cell.className = 'cell';

            cell.dataset.x = x;
            cell.dataset.y = y;

            const trail = getTrailIndex(x, y);

            if (trail === 0)
                cell.classList.add('ip');

            else if (trail > 0)
                cell.classList.add(`ip-trail-${trail}`);

            cell.textContent = board[y][x];

            if (isSelected(x, y))
                cell.classList.add('selected');

            if (x === cx && y === cy)
                cell.classList.add('cursor');

            editor.appendChild(cell);
        }
    }

    hidden_input.focus();
}


/* ======================
   셀 클릭 선택
====================== */

editor.addEventListener('mousedown', e => {

    const cell = e.target.closest('.cell');

    if (!cell) return;

    selecting = true;

    cx = Number(cell.dataset.x);
    cy = Number(cell.dataset.y);

    selectStartX = cx;
    selectStartY = cy;

    selectEndX = cx;
    selectEndY = cy;

    render();

    setTimeout(() => hidden_input.focus(), 0);
});

editor.addEventListener('mousemove', e => {

    if (!selecting)
        return;

    const cell = e.target.closest('.cell');

    if (!cell)
        return;

    selectEndX = Number(cell.dataset.x);
    selectEndY = Number(cell.dataset.y);

    render();
});

window.addEventListener('mouseup', () => {
    selecting = false;
});

/* ======================
   keyboard
====================== */

document.addEventListener('keydown', e => {

    if (e.key === 'ArrowLeft') {
        moveLeft();
        render();
    }

    else if (e.key === 'ArrowRight') {
        moveRight();
        render();
    }

    else if (e.key === 'ArrowUp') {
        moveUp();
        render();
    }

    else if (e.key === 'ArrowDown') {
        moveDown();
        render();
    }

    else if (e.key === 'Backspace') {
        e.preventDefault();

        board[cy][cx] = ' ';

        moveLeft();

        render();
    }

    else if (e.key === 'Delete') {
        e.preventDefault();

        board[cy][cx] = ' ';

        render();
    }
});

/* ======================
   IME 입력 (한글)
====================== */

hidden_input.addEventListener('compositionstart', () => {
    composing = true;
    compositionText = '';
});

hidden_input.addEventListener('compositionupdate', e => {
    compositionText = e.data;

    board[cy][cx] = compositionText;

    render();
});

hidden_input.addEventListener('compositionend', e => {

    composing = false;

    board[cy][cx] = e.data;

    compositionText = '';

    hidden_input.value = '';

    moveRight();

    render();
});

/* ======================
   일반 입력
====================== */

hidden_input.addEventListener('input', () => {

    if (composing) return;

    const val = hidden_input.value;

    if (!val) return;

    board[cy][cx] = val.slice(-1);

    hidden_input.value = '';

    moveRight();

    render();
});

/* ======================
   붙여넣기
====================== */

hidden_input.addEventListener('paste', e => {
    e.preventDefault();

    const text = e.clipboardData.getData('text');

    let x = cx;
    let y = cy;

    for (const ch of text) {

        if (ch === '\r')
            continue;

        if (ch === '\n') {
            y++;

            while (y >= H)
                expandHeight();

            x = 0;
            continue;
        }

        while (x >= W)
            expandWidth();

        board[y][x] = ch;

        x++;
    }

    cx = x;
    cy = y;

    if (cx >= W) {
        cx = 0;

        if (cy < H - 1)
            cy++;
    }

    render();
});

/* ======================
   focus fix
====================== */

window.addEventListener('mousedown', () => {
    setTimeout(() => hidden_input.focus(), 0);
});

window.render = render;

render();