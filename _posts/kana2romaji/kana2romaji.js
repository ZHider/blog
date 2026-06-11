// 基本假名到罗马音的映射表
const kanaToRomaji = {
  // 清音 (五十音图)
  あ: "a",
  い: "i",
  う: "u",
  え: "e",
  お: "o",
  か: "ka",
  き: "ki",
  く: "ku",
  け: "ke",
  こ: "ko",
  さ: "sa",
  し: "shi",
  す: "su",
  せ: "se",
  そ: "so",
  た: "ta",
  ち: "chi",
  つ: "tsu",
  て: "te",
  と: "to",
  な: "na",
  に: "ni",
  ぬ: "nu",
  ね: "ne",
  の: "no",
  は: "ha",
  ひ: "hi",
  ふ: "fu",
  へ: "he",
  ほ: "ho",
  ま: "ma",
  み: "mi",
  む: "mu",
  め: "me",
  も: "mo",
  や: "ya",
  ゆ: "yu",
  よ: "yo",
  ら: "ra",
  り: "ri",
  る: "ru",
  れ: "re",
  ろ: "ro",
  わ: "wa",
  を: "wo",
  ん: "n",

  // 浊音
  が: "ga",
  ぎ: "gi",
  ぐ: "gu",
  げ: "ge",
  ご: "go",
  ざ: "za",
  じ: "ji",
  ず: "zu",
  ぜ: "ze",
  ぞ: "zo",
  だ: "da",
  ぢ: "ji",
  づ: "zu",
  で: "de",
  ど: "do",
  ば: "ba",
  び: "bi",
  ぶ: "bu",
  べ: "be",
  ぼ: "bo",

  // 半浊音
  ぱ: "pa",
  ぴ: "pi",
  ぷ: "pu",
  ぺ: "pe",
  ぽ: "po",

  // 片假名
  ア: "a",
  イ: "i",
  ウ: "u",
  エ: "e",
  オ: "o",
  カ: "ka",
  キ: "ki",
  ク: "ku",
  ケ: "ke",
  コ: "ko",
  サ: "sa",
  シ: "shi",
  ス: "su",
  セ: "se",
  ソ: "so",
  タ: "ta",
  チ: "chi",
  ツ: "tsu",
  テ: "te",
  ト: "to",
  ナ: "na",
  ニ: "ni",
  ヌ: "nu",
  ネ: "ne",
  ノ: "no",
  ハ: "ha",
  ヒ: "hi",
  フ: "fu",
  ヘ: "he",
  ホ: "ho",
  マ: "ma",
  ミ: "mi",
  ム: "mu",
  メ: "me",
  モ: "mo",
  ヤ: "ya",
  ユ: "yu",
  ヨ: "yo",
  ラ: "ra",
  リ: "ri",
  ル: "ru",
  レ: "re",
  ロ: "ro",
  ワ: "wa",
  ヲ: "wo",
  ン: "n",

  // 片假名浊音
  ガ: "ga",
  ギ: "gi",
  グ: "gu",
  ゲ: "ge",
  ゴ: "go",
  ザ: "za",
  ジ: "ji",
  ズ: "zu",
  ゼ: "ze",
  ゾ: "zo",
  ダ: "da",
  ヂ: "ji",
  ヅ: "zu",
  デ: "de",
  ド: "do",
  バ: "ba",
  ビ: "bi",
  ブ: "bu",
  ベ: "be",
  ボ: "bo",

  // 片假名半浊音
  パ: "pa",
  ピ: "pi",
  プ: "pu",
  ペ: "pe",
  ポ: "po",

  // 拗音词典
  や: "ya",
  ゆ: "yu",
  よ: "yo",
  き: "ki",
  きゃ: "kya",
  きゅ: "kyu",
  きょ: "kyo",
  ぎ: "gi",
  ぎゃ: "gya",
  ぎゅ: "gyu",
  ぎょ: "gyo",
  し: "shi",
  しゃ: "sha",
  しゅ: "shu",
  しょ: "sho",
  ち: "chi",
  ちゃ: "cha",
  ちゅ: "chu",
  ちょ: "cho",
  じ: "ji",
  ぢ: "ji",
  じゃ: "ja",
  ぢゃ: "ja",
  じゅ: "ju",
  ぢゅ: "ju",
  じょ: "jo",
  ぢょ: "jo",
  に: "ni",
  にゃ: "nya",
  にゅ: "nyu",
  にょ: "nyo",
  ひ: "hi",
  ひゃ: "hya",
  ひゅ: "hyu",
  ひょ: "hyo",
  び: "bi",
  びゃ: "bya",
  びゅ: "byu",
  びょ: "byo",
  ぴ: "pi",
  ぴゃ: "pya",
  ぴゅ: "pyu",
  ぴょ: "pyo",
  み: "mi",
  みゃ: "mya",
  みゅ: "myu",
  みょ: "myo",
  り: "ri",
  りゃ: "rya",
  りゅ: "ryu",
  りょ: "ryo",

  ヤ: "ya",
  ユ: "yu",
  ヨ: "yo",
  キ: "ki",
  キャ: "kya",
  キュ: "kyu",
  キョ: "kyo",
  ギ: "gi",
  ギャ: "gya",
  ギュ: "gyu",
  ギョ: "gyo",
  シ: "shi",
  シャ: "sha",
  シュ: "shu",
  ショ: "sho",
  チ: "chi",
  チャ: "cha",
  チュ: "chu",
  チョ: "cho",
  ジ: "ji",
  ヂ: "ji",
  ジャ: "ja",
  ヂャ: "ja",
  ジュ: "ju",
  ヂュ: "ju",
  ジョ: "jo",
  ヂョ: "jo",
  ニ: "ni",
  ニャ: "nya",
  ニュ: "nyu",
  ニョ: "nyo",
  ヒ: "hi",
  ヒャ: "hya",
  ヒュ: "hyu",
  ヒョ: "hyo",
  ビ: "bi",
  ビャ: "bya",
  ビュ: "byu",
  ビョ: "byo",
  ピ: "pi",
  ピャ: "pya",
  ピュ: "pyu",
  ピョ: "pyo",
  ミ: "mi",
  ミャ: "mya",
  ミュ: "myu",
  ミョ: "myo",
  リ: "ri",
  リャ: "rya",
  リュ: "ryu",
  リョ: "ryo",
};

// 日语假名转罗马音函数
function convertToRomaji(text) {
  let result = "";
  let i = 0;

  while (i < text.length) {
    // 检查当前字符是否为特殊字符（非假名且不在字典中）
    // 如果当前字符是换行符、空格等，我们直接输出
    const currentChar = text[i];
    if (currentChar === "\n" || currentChar === "\t" || currentChar === " ") {
      result += currentChar;
      i++;
      continue;
    }

    // 1. 优先尝试匹配两个字符的组合（拗音等）
    if (i + 1 < text.length) {
      const twoChar = text.substring(i, i + 2);
      if (kanaToRomaji[twoChar]) {
        let romaji = kanaToRomaji[twoChar];

        // 处理长音
        if (i + 2 < text.length && isLongVowel(text[i + 2])) {
          romaji = doubleLastVowel(romaji);
          result += `<ruby>${twoChar}${text[i + 2]}<rt>${romaji}</rt></ruby>`;
          i += 3;
        } else {
          result += `<ruby>${twoChar}<rt>${romaji}</rt></ruby>`;
          i += 2;
        }
        continue;
      }
    }

    // 2. 处理单个字符
    const char = text[i];

    // 处理促音
    if (isSmallTsu(char)) {
      if (i + 1 < text.length && kanaToRomaji[text[i + 1]]) {
        const nextRomaji = kanaToRomaji[text[i + 1]];
        result += `<ruby>${char}${text[i + 1]}<rt>${
          nextRomaji[0] + nextRomaji
        }</rt></ruby>`;
        i += 2;
      } else {
        result += `<ruby>${char}<rt>(促音)</rt></ruby>`;
        i += 1;
      }
      continue;
    }

    // 处理长音符号
    if (isLongVowel(char)) {
      result += `<ruby>${char}<rt>-(长音)</rt></ruby>`;
      i += 1;
      continue;
    }

    // 处理普通假名
    if (kanaToRomaji[char]) {
      let romaji = kanaToRomaji[char];

      // 处理后面跟着的长音
      if (i + 1 < text.length && isLongVowel(text[i + 1])) {
        romaji = doubleLastVowel(romaji);
        result += `<ruby>${char}${text[i + 1]}<rt>${romaji}</rt></ruby>`;
        i += 2;
      } else {
        result += `<ruby>${char}<rt>${romaji}</rt></ruby>`;
        i += 1;
      }
      continue;
    }

    // 非假名字符直接添加
    result += char;
    i += 1;
  }

  // 辅助函数：检查是否为长音符号
  function isLongVowel(char) {
    return char === "ー" || char === "−";
  }

  // 辅助函数：检查是否为促音
  function isSmallTsu(char) {
    return char === "っ" || char === "ッ";
  }

  // 辅助函数：双写最后一个元音
  function doubleLastVowel(text) {
    return text.slice(0, -1) + text.slice(-1) + text.slice(-1);
  }

  return result;
}

// 事件监听
document.getElementById("convert-btn").addEventListener("click", function () {
  const inputText = document.getElementById("kana-input").value;
  const outputDiv = document.getElementById("output");

  if (inputText.trim() === "") {
    outputDiv.innerHTML = '<p style="color: #999;">请输入日文假名</p>';
    return;
  }

  const romajiText = convertToRomaji(inputText);
  outputDiv.innerHTML = romajiText;
});
