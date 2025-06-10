$(document).ready(function () {
    const select = $('#puzzleSelect');
    const start = $('#start');
    const gameContainer = $('#gameContainer');

    let currentPuzzle = puzzle[0];
    let boardData = [];
    let size = 0;
    let islands = [];

    function key(r, c) {
        return `${r},${c}`;
    }

    $.each(puzzle, function (i, p) {
        select.append($('<option>', {
            value: i,
            text: p.name
        }));
    });

    select.on('change', function () {
        currentPuzzle = puzzle[$(this).val()];
    });

    function drawTable(p) {
        size = p.size;
        boardData = Array.from({ length: size }, () => Array(size).fill(""));
        islands = [];

        for (let i = 0; i < p.island_row.length; i++) {
            const r = p.island_row[i] - 1;
            const c = p.island_col[i] - 1;
            const num = p.island_num[i];
            boardData[r][c] = "" + num;
            islands.push({ row: r, col: c, num: num });
        }

        const table = $('<table border="1">');
        for (let r = 0; r < size; r++) {
            const tr = $('<tr>');
            for (let c = 0; c < size; c++) {
                const td = $('<td>').data('row', r).data('col', c);
                if (boardData[r][c] !== "") {
                    td.text(boardData[r][c]).addClass('island');
                }
                tr.append(td);
            }
            table.append(tr);
        }

        gameContainer.empty().append(table);

        $('td').on('click', function (e) {
            if (e.which === 1) handleBridgeDraw($(this));
        });

        $('td').on('contextmenu', function (e) {
            e.preventDefault();
            const td = $(this);
            const row = td.data('row');
            const col = td.data('col');
            const val = boardData[row][col];
            if (val === "" || td.hasClass('island')) return;

            let dr = 0, dc = 0;
            if (val === '-' || val === '=') dc = 1;
            else if (val === '|' || val === '||') dr = 1;
            else return;

            let r = row, c = col;
            while (
                r - dr >= 0 && r - dr < size &&
                c - dc >= 0 && c - dc < size &&
                boardData[r - dr][c - dc] === val
            ) {
                r -= dr;
                c -= dc;
            }
            while (r >= 0 && r < size && c >= 0 && c < size && boardData[r][c] === val) {
                boardData[r][c] = "";
                $('td').filter(function () {
                    return $(this).data('row') === r && $(this).data('col') === c;
                }).text("");
                r += dr;
                c += dc;
            }

            Azuriraj_Boje_Otoka();
            provjeri_Pobjedu();
        });
    }

    function handleBridgeDraw(cell) {
        const row = cell.data('row');
        const col = cell.data('col');
        const bridgeVal = $('input[name="bridge"]:checked').val();
        if (!bridgeVal) return;
        if (cell.hasClass('island') || cell.text() !== "") return;

        const direction = bridgeVal[0];
        const count = bridgeVal.length === 2 ? 2 : 1;

        if (direction === '-' || direction === '=') {
            let left = col - 1;
            while (left >= 0 && boardData[row][left] === "") left--;
            let right = col + 1;
            while (right < size && boardData[row][right] === "") right++;
            if (
                left >= 0 && right < size &&
                $('td').filter(function () {
                    return $(this).data('row') === row && $(this).data('col') === left;
                }).hasClass('island') &&
                $('td').filter(function () {
                    return $(this).data('row') === row && $(this).data('col') === right;
                }).hasClass('island')
            ) {

                let canDraw = true;
                for (let cc = left + 1; cc < right; cc++) {
                    if (boardData[row][cc] !== "") {
                        canDraw = false;
                        break;
                    }
                }
                if (canDraw) {
                    for (let cc = left + 1; cc < right; cc++) {
                        boardData[row][cc] = bridgeVal;
                        $('td').filter(function () {
                            return $(this).data('row') === row && $(this).data('col') === cc;
                        }).text(bridgeVal);
                    }
                }
            }
        } else if (direction === '|') {
            let up = row - 1;
            while (up >= 0 && boardData[up][col] === "") up--;
            let down = row + 1;
            while (down < size && boardData[down][col] === "") down++;

            if (
                up >= 0 && down < size &&
                $('td').filter(function () {
                    return $(this).data('row') === up && $(this).data('col') === col;
                }).hasClass('island') &&
                $('td').filter(function () {
                    return $(this).data('row') === down && $(this).data('col') === col;
                }).hasClass('island')
            ) {

                let canDraw = true;
                for (let rr = up + 1; rr < down; rr++) {
                    if (boardData[rr][col] !== "") {
                        canDraw = false;
                        break;
                    }
                }
                if (canDraw) {
                    for (let rr = up + 1; rr < down; rr++) {
                        boardData[rr][col] = bridgeVal;
                        $('td').filter(function () {
                            return $(this).data('row') === rr && $(this).data('col') === col;
                        }).text(bridgeVal);
                    }
                }
            }
        }

        Azuriraj_Boje_Otoka();
        provjeri_Pobjedu();
    }

    function Azuriraj_Boje_Otoka() {
        for (const island of islands) {
            const { row, col, num } = island;
            let count = 0;

            const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
            for (const [dr, dc] of directions) {
                let r = row + dr, c = col + dc;
                let bridgeType = "";
                while (r >= 0 && r < size && c >= 0 && c < size) {
                    const val = boardData[r][c];
                    if (val === "" || val === undefined) break;
                    if (["-", "=", "|", "||"].includes(val)) {
                        bridgeType = val;
                        r += dr;
                        c += dc;
                    } else {
                        if (bridgeType === '-') count += 1;
                        else if (bridgeType === '=') count += 2;
                        else if (bridgeType === '|') count += 1;
                        else if (bridgeType === '||') count += 2;
                        break;
                    }
                }
            }

            const td = $('td').filter(function () {
                return $(this).data('row') === row && $(this).data('col') === col;
            });

            if (count === num) {
                td.css('background-color', 'lightgreen');
                td.addClass('zelena');
            } else {
                td.css('background-color', '');
                td.removeClass('zelena');
            }
        }
    }

    function provjeriPovezanost() {
        if (islands.length === 0) return false;

        const visited = new Set();
        const q = [];
        const first = islands[0];
        q.push({ row: first.row, col: first.col });
        visited.add(key(first.row, first.col));

        while (q.length > 0) {
            const { row, col } = q.shift();
            const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

            for (const [dr, dc] of directions) {
                let r = row + dr, c = col + dc;
                while (r >= 0 && r < size && c >= 0 && c < size) {
                    const val = boardData[r][c];
                    if (["-", "=", "|", "||"].includes(val)) {
                        r += dr;
                        c += dc;
                    } else if (val !== "") {
                        const k = key(r, c);
                        if (!visited.has(k)) {
                            visited.add(k);
                            q.push({ row: r, col: c });
                        }
                        break;
                    } else {
                        break;
                    }
                }
            }
        }

        return visited.size === islands.length;
    }

    function provjeri_Pobjedu() {
        const sviZeleni = islands.every(island => {
            const td = $('td').filter(function () {
                return $(this).data('row') === island.row && $(this).data('col') === island.col;
            });
            return td.hasClass('zelena');
        });

        console.log("Svi zeleni?", sviZeleni, "– Povezani?", provjeriPovezanost());
        if (sviZeleni && provjeriPovezanost()) {
            setTimeout(() => alert("Čestitamo! Završili ste igru."), 100);
        }
    }

    start.on('click', function () {
        drawTable(currentPuzzle);
    });


});
