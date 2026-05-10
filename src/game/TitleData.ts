export interface TitleInfo {
    id: string;
    name: string;
    description: string;
    hint: string;
    category: 'skill' | 'style' | 'score' | 'record';
    secret?: boolean;
}

export const TITLE_COLLECTION: TitleInfo[] = [
    // スキル系
    {
        id: '灰を眺める者',
        name: '灰を眺める者',
        description: '一つの言葉も紡がず、静かに終焉を見届けた。',
        hint: '一度も入力せずにタイムアップを迎える',
        category: 'skill',
        secret: true
    },
    {
        id: '灰を払う者',
        name: '灰を払う者',
        description: '灰に埋もれた言葉を払い、確かな命を吹き込んだ。',
        hint: '1回のプレイで10単語以上をクリアする',
        category: 'skill'
    },
    {
        id: '神速の語り手',
        name: '神速の語り手',
        description: '思考よりも早く、言葉を紡ぐ者。',
        hint: 'WPM 60以上を記録する',
        category: 'skill'
    },
    {
        id: '瞬きの風',
        name: '瞬きの風',
        description: 'その指先は風となり、一瞬の間に森を成す。',
        hint: 'WPM 100以上を記録する',
        category: 'skill'
    },
    {
        id: '絶対の調律師',
        name: '絶対の調律師',
        description: '一音の乱れもなく、完璧な旋律を奏でた。',
        hint: 'ミスなしで50単語以上をクリアする',
        category: 'skill'
    },
    // プレイスタイル系
    {
        id: '静寂の観察者',
        name: '静寂の観察者',
        description: '冷静沈着に、確かな一打を重ねる者。',
        hint: '正確率 98% 以上かつ30単語以上をクリアする',
        category: 'style'
    },
    {
        id: '森の守護者',
        name: '森の守護者',
        description: '一つの落葉も許さず、命の輝きを繋ぎ止めた。',
        hint: '1つの言葉も枯らさず(落葉なし)に50単語以上をクリアする',
        category: 'style'
    },
    {
        id: '終焉を生きる者',
        name: '終焉を生きる者',
        description: '腐朽を受け入れ、その中から新たな芽吹きを見出す者。',
        hint: '落葉を許容しながら50単語以上をクリアする',
        category: 'style'
    },
    // スコア・神話系
    {
        id: '死の淵を歩む者',
        name: '死の淵を歩む者',
        description: '灰の世界に、確かな足跡を残した。',
        hint: 'スコア 5,000 pt 以上を記録する',
        category: 'score'
    },
    {
        id: 'ヴァルハラの賓客',
        name: 'ヴァルハラの賓客',
        description: 'その力、神々の住まう館に届かん。',
        hint: 'スコア 15,000 pt 以上を記録する',
        category: 'score'
    },
    {
        id: '世界樹の再誕者',
        name: '世界樹の再誕者',
        description: '失われた大樹の断片を、現代に呼び覚ます者。',
        hint: 'スコア 30,000 pt 以上を記録する',
        category: 'score'
    },
    {
        id: 'ユグドラシルの守護者',
        name: 'ユグドラシルの守護者',
        description: 'もはやこの木は、あなたなしでは存続し得ない。',
        hint: 'スコア 60,000 pt 以上を記録する',
        category: 'score'
    },
    {
        id: 'ラグナロクの覇者',
        name: 'ラグナロクの覇者',
        description: '終末すらも、あなたの紡ぐ言葉には抗えない。',
        hint: 'スコア 100,000 pt 以上を記録する',
        category: 'score'
    },
    // 累計実績・特殊
    {
        id: '根を張る者',
        name: '根を張る者',
        description: 'あなたの紡いだ言葉は、深く大地に根を張っている。',
        hint: '累計クリア単語数が 500 を超える',
        category: 'record'
    },
    {
        id: 'ユミルの溜息',
        name: 'ユミルの溜息',
        description: '古の巨人の記憶すらも、あなたの言葉に震える。',
        hint: '累計クリア単語数が 2,000 を超える',
        category: 'record'
    },
    {
        id: '夜空の観測者',
        name: '夜空の観測者',
        description: '静寂が支配する深夜、あなたは言葉を灯し続けた。',
        hint: '深夜（0時〜4時）にプレイする',
        category: 'record',
        secret: true
    },
    {
        id: '時を刻む芽',
        name: '時を刻む芽',
        description: '限られた命の中で、悠久の時を刻んだ。',
        hint: '1回のプレイで10分以上生存する',
        category: 'record'
    },
    {
        id: '一枝の探究者',
        name: '一枝の探究者',
        description: '脇目も振らず、一つの真理を追い求めた果て。',
        hint: '特定の系統を深く(深さ15以上)まで伸ばし続ける',
        category: 'record',
        secret: true
    }
];
