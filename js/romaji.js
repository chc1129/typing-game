// バージョン確認用ログ（置き換え確認後に削除してよい）
console.log('[romaji.js] トライ木版 v2 が読み込まれました');

// =========================
// romaji.js — トライ木方式ローマ字辞書
// =========================
//
// 【トライ木とは】
// 入力文字列を1文字ずつ分岐する木構造のこと。
// 例) 'しょ' のパターン ['syo','sho'] は以下の木になる:
//
//   root
//    └─ s
//        ├─ y → o →（syo = しょ）
//        └─ h → o →（sho = しょ）
//
// キー入力のたびに node.children[key] を1回参照するだけで
// 正解・ミスを判定できる。
// =========================


// =========================
// かな文字ごとの許容パターン定義
// =========================
// key  : ローマ字（標準パターン = 先頭要素）
// value: 許容するすべてのローマ字パターンの配列
export const KANA_PATTERNS = {

    // ── あ行 ──
    'a': ['a'], 'i': ['i'], 'u': ['u', 'wu'], 'e': ['e'], 'o': ['o'],

    // ── か行 ──
    'ka': ['ka'], 'ki': ['ki'], 'ku': ['ku'], 'ke': ['ke'], 'ko': ['ko'],

    // ── さ行 ──
    'sa': ['sa'],
    'si': ['si', 'shi'],    // し: si / shi
    'su': ['su'],
    'se': ['se'],
    'so': ['so'],

    // ── た行 ──
    'ta': ['ta'],
    'ti': ['ti', 'chi'],    // ち: ti / chi
    'tu': ['tu', 'tsu'],    // つ: tu / tsu
    'te': ['te'],
    'to': ['to'],

    // ── な行 ──
    'na': ['na'], 'ni': ['ni'], 'nu': ['nu'], 'ne': ['ne'], 'no': ['no'],

    // ── は行 ──
    'ha': ['ha'], 'hi': ['hi'],
    'hu': ['hu', 'fu'],     // ふ: hu / fu
    'he': ['he'], 'ho': ['ho'],

    // ── ふぁ行（外来語） ──
    'fa': ['fa'],           // ふぁ
    'fi': ['fi'],           // ふぃ
    'fo': ['fo'],           // ふぉ

    // ── ま行 ──
    'ma': ['ma'], 'mi': ['mi'], 'mu': ['mu'], 'me': ['me'], 'mo': ['mo'],

    // ── や行 ──
    'ya': ['ya'], 'yu': ['yu'], 'yo': ['yo'],

    // ── ら行 ──
    'ra': ['ra'], 'ri': ['ri'], 'ru': ['ru'], 're': ['re'], 'ro': ['ro'],

    // ── わ行 ──
    'wa': ['wa'], 'wo': ['wo'],

    // ── 長音符 ──
    '-': ['-'],              // ー: - キーで入力する
    '!': ['!'],              // !: ! キーで入力する
    ' ': [' '],
 
    // ── ん ──
    // 単体 n / 重ね nn / xn
    'n': ['n', 'nn', 'xn'],

    // ── が行 ──
    'ga': ['ga'], 'gi': ['gi'], 'gu': ['gu'], 'ge': ['ge'], 'go': ['go'],

    // ── ざ行 ──
    'za': ['za'],
    'zi': ['zi', 'ji'],     // じ: zi / ji
    'zu': ['zu'], 'ze': ['ze'], 'zo': ['zo'],

    // ── だ行 ──
    'da': ['da'], 'di': ['di'], 'du': ['du'], 'de': ['de'], 'do': ['do'],

    // ── ば行 ──
    'ba': ['ba'], 'bi': ['bi'], 'bu': ['bu'], 'be': ['be'], 'bo': ['bo'],

    // ── ぱ行 ──
    'pa': ['pa'], 'pi': ['pi'], 'pu': ['pu'], 'pe': ['pe'], 'po': ['po'],

    // ── きゃ行 ──
    'kya': ['kya'], 'kyu': ['kyu'], 'kyo': ['kyo'],

    // ── しゃ行 ──
    'sya': ['sya', 'sha'],  // しゃ: sya / sha
    'syu': ['syu', 'shu'],  // しゅ: syu / shu
    'syo': ['syo', 'sho'],  // しょ: syo / sho

    // ── ちゃ行 ──
    'tya': ['tya', 'cha'],  // ちゃ: tya / cha
    'tyu': ['tyu', 'chu'],  // ちゅ: tyu / chu
    'tyo': ['tyo', 'cho'],  // ちょ: tyo / cho

    // ── にゃ行 ──
    'nya': ['nya'], 'nyu': ['nyu'], 'nyo': ['nyo'],

    // ── ひゃ行 ──
    'hya': ['hya'], 'hyu': ['hyu'], 'hyo': ['hyo'],

    // ── みゃ行 ──
    'mya': ['mya'], 'myu': ['myu'], 'myo': ['myo'],

    // ── りゃ行 ──
    'rya': ['rya'], 'ryu': ['ryu'], 'ryo': ['ryo'],

    // ── ぎゃ行 ──
    'gya': ['gya'], 'gyu': ['gyu'], 'gyo': ['gyo'],

    // ── じゃ行 ──
    'zya': ['zya', 'ja'],   // じゃ: zya / ja
    'zyu': ['zyu', 'ju'],   // じゅ: zyu / ju
    'zyo': ['zyo', 'jo'],   // じょ: zyo / jo

    // ── びゃ行 ──
    'bya': ['bya'], 'byu': ['byu'], 'byo': ['byo'],

    // ── ぴゃ行 ──
    'pya': ['pya'], 'pyu': ['pyu'], 'pyo': ['pyo'],

    // ── 小文字 ──
    'xtu': ['xtu', 'ltu', 'ttu'],   // っ: xtu / ltu / ttu（子音重複は input.js で処理）
    'xa':  ['xa',  'la'],            // ぁ
    'xi':  ['xi',  'li'],            // ぃ
    'xu':  ['xu',  'lu'],            // ぅ
    'xe':  ['xe',  'le'],            // ぇ
    'xo':  ['xo',  'lo'],            // ぉ
    'xya': ['xya', 'lya'],           // ゃ
    'xyu': ['xyu', 'lyu'],           // ゅ
    'xyo': ['xyo', 'lyo'],           // ょ
    'xwa': ['xwa', 'lwa'],           // ゎ

    // ── 数字 ──
    '0': ['0'], '1': ['1'], '2': ['2'], '3': ['3'], '4': ['4'], 
    '5': ['5'], '6': ['6'], '7': ['7'], '8': ['8'], '9': ['9'],

        // ── 英字 ──
    'A': ['A'], 'B': ['B'], 'C': ['C'], 'D': ['D'], 'E': ['E'],
    'F': ['F'], 'G': ['G'], 'H': ['H'], 'I': ['I'], 'J': ['J'], 
    'K': ['K'], 'L': ['L'], 'M': ['M'], 'N': ['N'], 'O': ['O'], 
    'P': ['P'], 'Q': ['Q'], 'R': ['R'], 'S': ['S'], 'T': ['T'], 
    'U': ['U'], 'V': ['V'], 'W': ['W'], 'X': ['X'], 'Y': ['Y'],
    'Z': ['Z'],
    'a': ['a'], 'b': ['b'], 'c': ['c'], 'd': ['d'], 'e': ['e'],
    'f': ['f'], 'g': ['g'], 'h': ['h'], 'i': ['i'], 'j': ['j'], 
    'k': ['k'], 'l': ['l'], 'm': ['m'], 'n': ['n'], 'o': ['o'], 
    'p': ['p'], 'q': ['q'], 'r': ['r'], 's': ['s'], 't': ['t'], 
    'u': ['u'], 'v': ['v'], 'w': ['w'], 'x': ['x'], 'y': ['y'],
    'z': ['z'],

};

// =========================
// 全パターン → 標準ローマ字 の逆引き辞書
// =========================
// words.json の値は 'syoshinsya' や 'shoshinsya' のように
// 様々なローマ字表記で登録される可能性がある
// splitRomaji でこれらを標準ローマ字配列に変換するために使う
// 例) 'shi' → 'si', 'sho' → 'syo', 'chi' → 'ti', 'nn' → 'n'
const PATTERN_TO_CANONICAL = {};
for (const [canonical, patterns] of Object.entries(KANA_PATTERNS)) {
    for (const pattern of patterns) {
        // すべての許容パターンを標準ローマ字にマッピングする
        PATTERN_TO_CANONICAL[pattern] = canonical;
    }
}

// =========================
// ローマ字文字列をローマ字配列に分解する関数
// =========================
// words.json の値 'syoshinsya' や 'shoshinsya' を
// 標準ローマ字配列 ['syo','si','n','sya'] に変換する
//
// 処理:
//   3文字 → 2文字 → 1文字 の順で PATTERN_TO_CANONICAL を参照する
//   例) 'shi' → PATTERN_TO_CANONICAL['shi'] = 'si' → 標準ローマ字 'si' として分解
//   例) 'nn'  → PATTERN_TO_CANONICAL['nn']  = 'n'  → 標準ローマ字 'n'  として分解
// 子音リスト（っの子音重複検出で使用する）
const CONSONANTS = new Set('bcdfghjklmnpqrstvwxyz');

export function splitRomaji(romajiStr) {
    const str = romajiStr.toLowerCase(); // 大文字を小文字に変換する

    const result = []; let i = 0;
    let justAddedXtu = false; // 直前に xtu を追加したかフラグ（3連続子音の2重登録を防ぐ）

    while (i < str.length) {

        // 連続子音検出（直前に xtu を追加していない場合のみ）
        // 例) tt → xtu + t（kitte）, ss → xtu + s（sassa）
        // n の連続（nn）は ん なので除外する
        if (!justAddedXtu
            && i + 1 < str.length
            && str[i] === str[i + 1]
            && CONSONANTS.has(str[i])
            && str[i] !== 'n') {
            result.push('xtu');
            justAddedXtu = true; // 次のループで連続子音チェックをスキップするフラグをセット
            i++;
            continue;
        }

        // 直前に xtu を追加した場合の処理
        if (justAddedXtu) {
            justAddedXtu = false;
            // 3連続子音の場合（sss 等）: 余分な s をスキップする
            // 例) sss → xtu(i++) → s をスキップ(i++) → si ✅
            if (i + 1 < str.length
                && str[i] === str[i + 1]
                && CONSONANTS.has(str[i])
                && str[i] !== 'n') {
                i++;
                continue;
            }
            // そうでない場合は通常処理に fall through する
        }

        // 3文字パターンを優先して照合する（sha, chi, tsu 等）
        const s3 = str.slice(i, i + 3);
        if (s3.length === 3 && PATTERN_TO_CANONICAL[s3]) { result.push(PATTERN_TO_CANONICAL[s3]); i+=3; continue; }

        // 2文字パターンを照合する（ka, si, syo, nn 等）
        const s2 = str.slice(i, i + 2);
        if (s2.length === 2 && PATTERN_TO_CANONICAL[s2]) { result.push(PATTERN_TO_CANONICAL[s2]); i+=2; continue; }

        // 1文字を照合する（a, i, u, n 等）
        const s1 = str[i];
        result.push(PATTERN_TO_CANONICAL[s1] || s1); i++;
    }
    return result;
}

// =========================
// トライ木の構築関数
// =========================
// KANA_PATTERNS の全パターンから木構造を生成する。
// ゲーム起動時に1回だけ実行する。
//
// 生成される木の例:
//   root.children['s'].children['y'].children['o'].complete = 'syo'
//   root.children['s'].children['h'].children['o'].complete = 'syo'
//   （complete には標準ローマ字 = KANA_PATTERNS のキーが入る）
export function buildTrie() {
    // ルートノード（木の頂点）
    const root = { children: {} };

    for (const [canonical, patterns] of Object.entries(KANA_PATTERNS)) {
        // canonical: 標準ローマ字 (例: 'syo')
        // patterns : 許容パターンの配列 (例: ['syo', 'sho'])
        for (const pattern of patterns) {
            let node = root;

            // パターンを1文字ずつ辿りながらノードを作る
            for (const ch of pattern) {
                if (!node.children[ch]) {
                    // 子ノードがなければ新規作成する
                    node.children[ch] = { children: {} };
                }
                node = node.children[ch]; // 子ノードへ進む
            }

            // パターンの末尾ノードに「完了情報」を記録する
            // complete: このノードに到達したらどの標準ローマ字が完了したか
            if (!node.complete) {
                node.complete = canonical;
            }
        }
    }

    return root;
}

// ゲーム起動時にトライ木を生成してエクスポートする
export const TRIE_ROOT = buildTrie();

// =========================
// 表示文字列の生成関数
// =========================
// ローマ字配列・現在位置・バッファ・確定済みパターンを受け取り
// 画面に表示する文字列を生成する。
//
// 例) romajiArray=['syo','si','n','sya'], romajiIndex=1, buffer='sh'
//     → 'syo' + 'shi' + 'nsya'  （siのshが入力中 → shiに表示切替）
//     → 'syoshinasya'
export function buildDisplay(romajiArray, romajiIndex, buffer, chosenPatterns) {
    let result = '';

    for (let i = 0; i < romajiArray.length; i++) {
        const canonical = romajiArray[i];
        const patterns  = KANA_PATTERNS[canonical] || [canonical];

        if (i < romajiIndex) {
            // 完了済みのローマ字 → 確定パターンを使う
            result += chosenPatterns[i] || canonical;

        } else if (i === romajiIndex) {
            // 現在入力中のローマ字 → バッファと候補から表示を決める
            if (buffer.length > 0) {
                const candidates = patterns.filter(p => p.startsWith(buffer));
                if (candidates.length === 1) {
                    result += candidates[0];
                } else {
                    result += buffer + canonical.slice(buffer.length);
                }
            } else {
                // xtu（っ）の場合: 次のかなの先頭子音で double consonant 表示する
                // 例) arr=[zu, xtu, to] → xtu の次は to → 先頭子音=t → 't' を表示
                // → zu + t + to = 'zutto' と表示される
                if (canonical === 'xtu' && i + 1 < romajiArray.length) {
                    const nextCanonical = romajiArray[i + 1];
                    const nextPrimary   = (KANA_PATTERNS[nextCanonical] || [nextCanonical])[0];
                    result += nextPrimary[0]; // 次のかなの先頭子音を1文字表示
                } else {
                    result += canonical;
                }
            }

        } else {
            // 未入力の xtu も double consonant 表示する
            if (canonical === 'xtu' && i + 1 < romajiArray.length) {
                const nextCanonical = romajiArray[i + 1];
                const nextPrimary   = (KANA_PATTERNS[nextCanonical] || [nextCanonical])[0];
                result += nextPrimary[0];
            } else {
                result += canonical;
            }
        }
    }
    return result;
}
