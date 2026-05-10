export interface AnimalData {
  id: string;
  name: string;
  mythName: string;
  description: string;
  unlockThreshold: number;
}

export const GARDEN_ANIMALS: AnimalData[] = [
  {
    id: 'raven',
    name: '鴉',
    mythName: 'フギン＆ムニン',
    description: 'オーディンに世界の情報を運ぶ一対の鴉。世界の再生を見届けるために舞い降りた。',
    unlockThreshold: 1,
  },
  {
    id: 'stag',
    name: '雄鹿',
    mythName: 'エイクスュルニル',
    description: '世界樹の枝を食む聖なる鹿。その角から滴る水は、あらゆる川の源流となると言われる。',
    unlockThreshold: 4,
  },
  {
    id: 'snake',
    name: '蛇',
    mythName: 'ニーズヘッグ',
    description: '世界樹の根を絶えず齧り続ける龍。死者の魂を喰らうと言われるが、この庭では静かに潜んでいる。',
    unlockThreshold: 8,
  },
  {
    id: 'cow',
    name: '牝牛',
    mythName: 'アウドムラ',
    description: '太古の氷を舐めて神々の祖先を誕生させた豊穣の牛。その乳は生命の源となる。',
    unlockThreshold: 8,
  },
  {
    id: 'squirrel',
    name: '栗鼠',
    mythName: 'ラタトスク',
    description: '世界樹の頂上と根元を往復する伝令の栗鼠。騒がしくも愛らしい庭の住人。',
    unlockThreshold: 13,
  },
  {
    id: 'goat',
    name: '山羊',
    mythName: 'ヘイズルーン',
    description: '世界樹の葉を食む山羊。その乳は尽きることのない蜜酒となり、勇者たちの喉を潤す。',
    unlockThreshold: 13,
  },
  {
    id: 'horse',
    name: '八足の馬',
    mythName: 'スレイプニル',
    description: 'オーディンの愛馬。八本の足で空を駆け、死者の国へも自在に行き来する地上最高の馬。',
    unlockThreshold: 19,
  },
  {
    id: 'wolf',
    name: '狼',
    mythName: 'ゲリとフレキ',
    description: 'オーディンの傍らに侍る一対の狼。主人の食事を分け与えられる、忠実で貪欲な守護者たち。',
    unlockThreshold: 19,
  },
  {
    id: 'eagle',
    name: '鷲',
    mythName: 'フレズベルグ',
    description: '世界の北端に座す巨鳥。その羽ばたきは世界を巡る風となり、新たな命を運ぶ。',
    unlockThreshold: 19,
  },
];
