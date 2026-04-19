import { mulberry32 } from "../random";
import type { TextProblem } from "../shared/types";

export type WordProblemMode = "add" | "sub" | "mixed";
export type WordProblemScript = "kanji" | "hiragana";

type Pick = <T>(arr: readonly T[]) => T;

interface Template {
  kind: "add" | "sub";
  make: (a: number, b: number, pick: Pick) => TextProblem;
}

export const generateAddSub1 = (
  seed: number,
  max: number,
  mode: WordProblemMode,
  script: WordProblemScript = "kanji",
): TextProblem[] => {
  const rng = mulberry32(seed);
  const pick = makePick(rng);
  const addQueue = shuffle(TEMPLATES.filter((t) => t.kind === "add"), rng);
  const subQueue = shuffle(TEMPLATES.filter((t) => t.kind === "sub"), rng);
  let addIdx = 0;
  let subIdx = 0;
  const problems: TextProblem[] = [];
  for (let i = 0; i < 10; i++) {
    const kind = chooseKind(mode, rng);
    const template = kind === "add"
      ? addQueue[addIdx++ % addQueue.length]
      : subQueue[subIdx++ % subQueue.length];
    const [a, b] = pickNumbers(rng, kind, max);
    problems.push(template.make(a, b, pick));
  }
  return script === "hiragana" ? problems.map(toHiraganaProblem) : problems;
};

const toHiraganaProblem = (p: TextProblem): TextProblem => ({
  question: toHiragana(p.question),
  answer: toHiragana(p.answer),
});

// Replace kanji that appear in generated questions with hiragana.
// Ordered longest-first so compound forms (e.g. 黄色くない) match before
// their shorter prefixes (黄色い).
const KANJI_PAIRS: [string, string][] = [
  ["黄色くない", "きいろくない"],
  ["黄色い", "きいろい"],
  ["赤くない", "あかくない"],
  ["青くない", "あおくない"],
  ["白くない", "しろくない"],
  ["黒くない", "くろくない"],
  ["男の子", "おとこのこ"],
  ["女の子", "おんなのこ"],
  ["子ども", "こども"],
  ["お店", "おみせ"],
  ["赤い", "あかい"],
  ["青い", "あおい"],
  ["白い", "しろい"],
  ["黒い", "くろい"],
  ["人", "にん"],
  ["木", "き"],
];

const toHiragana = (s: string): string => {
  let out = s;
  for (const [k, h] of KANJI_PAIRS) out = out.split(k).join(h);
  return out;
};

const chooseKind = (mode: WordProblemMode, rng: () => number): "add" | "sub" => {
  if (mode === "add") return "add";
  if (mode === "sub") return "sub";
  return rng() < 0.5 ? "add" : "sub";
};

const pickNumbers = (
  rng: () => number,
  kind: "add" | "sub",
  max: number,
): [number, number] => {
  if (kind === "add") {
    const total = 2 + Math.floor(rng() * (max - 1));
    const a = 1 + Math.floor(rng() * (total - 1));
    return [a, total - a];
  }
  const a = 2 + Math.floor(rng() * (max - 1));
  const b = 1 + Math.floor(rng() * (a - 1));
  return [a, b];
};

const makePick = (rng: () => number): Pick => <T>(arr: readonly T[]): T =>
  arr[Math.floor(rng() * arr.length)];

const pickTwoDistinct = <T>(arr: readonly T[], pick: Pick): [T, T] => {
  const a = pick(arr);
  let b = pick(arr);
  while (b === a && arr.length > 1) b = pick(arr);
  return [a, b];
};

const shuffle = <T>(arr: readonly T[], rng: () => number): T[] => {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

// ---------- Object dictionaries ----------

const FOODS = [
  "りんご", "みかん", "いちご", "バナナ", "もも", "なし", "メロン", "ぶどう",
  "ドーナツ", "ケーキ", "プリン", "ゼリー", "あめ", "チョコ", "クッキー",
  "ビスケット", "グミ", "まんじゅう", "だんご", "パン", "おにぎり",
] as const;
const FRAGILE = ["たまご", "ふうせん", "おさら", "コップ", "グラス", "おちゃわん"] as const;
const BIRDS = ["とり", "はと", "すずめ", "からす", "つばめ", "ひよこ", "にわとり"] as const;
const COLORS = ["赤い", "青い", "白い", "黄色い", "黒い"] as const;

const ANIMALS_HIKI = [
  "いぬ", "ねこ", "うさぎ", "ハムスター", "リス", "きんぎょ", "かめ", "かえる",
] as const;
const INSECTS_HIKI = [
  "ちょう", "はち", "アリ", "てんとうむし", "かぶとむし", "バッタ", "せみ",
] as const;

interface ObjectCtr {
  name: string;
  counter: string;
}

const COLORABLE: ObjectCtr[] = [
  { name: "おりがみ", counter: "まい" },
  { name: "カード", counter: "まい" },
  { name: "シール", counter: "まい" },
  { name: "ハンカチ", counter: "まい" },
  { name: "ふうせん", counter: "こ" },
  { name: "ボール", counter: "こ" },
  { name: "ぼうし", counter: "こ" },
];

const GIFTABLES: ObjectCtr[] = [
  { name: "あめ", counter: "こ" },
  { name: "クッキー", counter: "こ" },
  { name: "チョコ", counter: "こ" },
  { name: "プリン", counter: "こ" },
  { name: "ボール", counter: "こ" },
  { name: "おもちゃ", counter: "こ" },
  { name: "ぬいぐるみ", counter: "こ" },
  { name: "おりがみ", counter: "まい" },
  { name: "シール", counter: "まい" },
  { name: "カード", counter: "まい" },
  { name: "ハンカチ", counter: "まい" },
];

const USABLES: ObjectCtr[] = [
  { name: "おりがみ", counter: "まい" },
  { name: "シール", counter: "まい" },
  { name: "カード", counter: "まい" },
  { name: "がようし", counter: "まい" },
  { name: "メモようし", counter: "まい" },
];

const BUYABLES: ObjectCtr[] = [
  { name: "りんご", counter: "こ" },
  { name: "みかん", counter: "こ" },
  { name: "バナナ", counter: "こ" },
  { name: "メロン", counter: "こ" },
  { name: "あめ", counter: "こ" },
  { name: "チョコ", counter: "こ" },
  { name: "ドーナツ", counter: "こ" },
  { name: "プリン", counter: "こ" },
  { name: "ぬいぐるみ", counter: "こ" },
  { name: "ふうせん", counter: "こ" },
  { name: "おりがみ", counter: "まい" },
  { name: "シール", counter: "まい" },
];

// ---------- Templates ----------

const TEMPLATES: Template[] = [
  // 合併 (combine): two groups joined into a total
  {
    kind: "add",
    make: (a, b, pick) => {
      const [c1, c2] = pickTwoDistinct(COLORS, pick);
      const o = pick(COLORABLE);
      return {
        question: `${c1}${o.name}が${a}${o.counter}、${c2}${o.name}が${b}${o.counter}あります。あわせてなん${o.counter}ありますか。`,
        answer: `${a + b}${o.counter}`,
      };
    },
  },
  {
    kind: "add",
    make: (a, b, pick) => {
      const [f1, f2] = pickTwoDistinct(FOODS, pick);
      return {
        question: `${f1}が${a}こと、${f2}が${b}こあります。ぜんぶでなんこありますか。`,
        answer: `${a + b}こ`,
      };
    },
  },
  {
    kind: "add",
    make: (a, b) => ({
      question: `男の子が${a}人、女の子が${b}人います。みんなでなん人ですか。`,
      answer: `${a + b}人`,
    }),
  },

  // 増加 (augment): start with some, get more, find total
  {
    kind: "add",
    make: (a, b, pick) => {
      const g = pick(GIFTABLES);
      return {
        question: `${g.name}が${a}${g.counter}ありました。${b}${g.counter}もらいました。ぜんぶでなん${g.counter}になりましたか。`,
        answer: `${a + b}${g.counter}`,
      };
    },
  },
  {
    kind: "add",
    make: (a, b) => ({
      question: `こうえんに子どもが${a}人いました。あとから${b}人きました。みんなでなん人になりましたか。`,
      answer: `${a + b}人`,
    }),
  },
  {
    kind: "add",
    make: (a, b, pick) => {
      const bird = pick(BIRDS);
      return {
        question: `木に${bird}が${a}わとまっていました。そこへ${b}わとんできました。ぜんぶでなんわになりましたか。`,
        answer: `${a + b}わ`,
      };
    },
  },
  {
    kind: "add",
    make: (a, b, pick) => {
      const o = pick(BUYABLES);
      return {
        question: `${o.name}を${a}${o.counter}もっています。お店で${b}${o.counter}かいました。ぜんぶでなん${o.counter}になりましたか。`,
        answer: `${a + b}${o.counter}`,
      };
    },
  },
  {
    kind: "add",
    make: (a, b, pick) => {
      const [an1, an2] = pickTwoDistinct(ANIMALS_HIKI, pick);
      return {
        question: `${an1}が${a}ひきと、${an2}が${b}ひきいます。あわせてなんひきですか。`,
        answer: `${a + b}ひき`,
      };
    },
  },
  {
    kind: "add",
    make: (a, b, pick) => {
      const ins = pick(INSECTS_HIKI);
      return {
        question: `はなに${ins}が${a}ひきとまっていました。そこへ${b}ひきとんできました。ぜんぶでなんひきになりましたか。`,
        answer: `${a + b}ひき`,
      };
    },
  },

  // 求残 (take-away): start with some, remove some, find remainder
  {
    kind: "sub",
    make: (a, b, pick) => {
      const f = pick(FOODS);
      return {
        question: `${f}が${a}こありました。${b}こたべました。のこりはなんこですか。`,
        answer: `${a - b}こ`,
      };
    },
  },
  {
    kind: "sub",
    make: (a, b, pick) => {
      const u = pick(USABLES);
      return {
        question: `${u.name}が${a}${u.counter}ありました。${b}${u.counter}つかいました。のこりはなん${u.counter}ですか。`,
        answer: `${a - b}${u.counter}`,
      };
    },
  },
  {
    kind: "sub",
    make: (a, b, pick) => {
      const g = pick(GIFTABLES);
      return {
        question: `${g.name}を${a}${g.counter}もっていました。ともだちに${b}${g.counter}あげました。のこりはなん${g.counter}ですか。`,
        answer: `${a - b}${g.counter}`,
      };
    },
  },
  {
    kind: "sub",
    make: (a, b) => ({
      question: `こうえんに子どもが${a}人いました。${b}人かえりました。のこっているのはなん人ですか。`,
      answer: `${a - b}人`,
    }),
  },
  {
    kind: "sub",
    make: (a, b, pick) => {
      const bird = pick(BIRDS);
      return {
        question: `木に${bird}が${a}わとまっていました。${b}わとんでいきました。のこりはなんわですか。`,
        answer: `${a - b}わ`,
      };
    },
  },
  {
    kind: "sub",
    make: (a, b, pick) => {
      const f = pick(FRAGILE);
      return {
        question: `${f}が${a}こありました。${b}こわれてしまいました。のこりはなんこですか。`,
        answer: `${a - b}こ`,
      };
    },
  },
  {
    kind: "sub",
    make: (a, b, pick) => {
      const ins = pick(INSECTS_HIKI);
      return {
        question: `はなに${ins}が${a}ひきとまっていました。${b}ひきとんでいきました。のこりはなんひきですか。`,
        answer: `${a - b}ひき`,
      };
    },
  },

  // 求差 (difference): compare two groups, find how many more
  {
    kind: "sub",
    make: (a, b) => ({
      question: `男の子が${a}人、女の子が${b}人います。男の子は女の子よりなん人おおいですか。`,
      answer: `${a - b}人`,
    }),
  },
  {
    kind: "sub",
    make: (a, b, pick) => {
      const [c1, c2] = pickTwoDistinct(COLORS, pick);
      const o = pick(COLORABLE);
      return {
        question: `${c1}${o.name}が${a}${o.counter}、${c2}${o.name}が${b}${o.counter}あります。${c1}${o.name}は${c2}${o.name}よりなん${o.counter}おおいですか。`,
        answer: `${a - b}${o.counter}`,
      };
    },
  },
  {
    kind: "sub",
    make: (a, b, pick) => {
      const [an1, an2] = pickTwoDistinct(ANIMALS_HIKI, pick);
      return {
        question: `${an1}が${a}ひき、${an2}が${b}ひきいます。${an1}は${an2}よりなんひきおおいですか。`,
        answer: `${a - b}ひき`,
      };
    },
  },

  // 求補 (missing part): total known, one part known, find the other
  {
    kind: "sub",
    make: (a, b) => ({
      question: `子どもが${a}人います。そのうち男の子は${b}人です。女の子はなん人ですか。`,
      answer: `${a - b}人`,
    }),
  },
  {
    kind: "sub",
    make: (a, b, pick) => {
      const o = pick(COLORABLE);
      const color = pick(COLORS);
      const negColor = color.replace(/い$/, "くない");
      return {
        question: `${o.name}が${a}${o.counter}あります。そのうち${color}${o.name}は${b}${o.counter}です。${negColor}${o.name}はなん${o.counter}ですか。`,
        answer: `${a - b}${o.counter}`,
      };
    },
  },
];
