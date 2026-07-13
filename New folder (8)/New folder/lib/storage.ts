export const Storage = {
    getHighScore: () => parseInt(typeof window !== 'undefined' ? localStorage.getItem('whirly_highscore') || '0' : '0'),
    setHighScore: (score: number) => typeof window !== 'undefined' && localStorage.setItem('whirly_highscore', score.toString()),
    getCoins: () => parseInt(typeof window !== 'undefined' ? localStorage.getItem('whirly_coins') || '0' : '0'),
    setCoins: (coins: number) => typeof window !== 'undefined' && localStorage.setItem('whirly_coins', coins.toString()),
    getSettings: () => JSON.parse(typeof window !== 'undefined' ? localStorage.getItem('whirly_settings') || '{"music":true, "sfx":true}' : '{"music":true, "sfx":true}'),
    setSettings: (settings: any) => typeof window !== 'undefined' && localStorage.setItem('whirly_settings', JSON.stringify(settings)),
    getTutorialDone: () => typeof window !== 'undefined' && localStorage.getItem('whirly_tutorial') === 'true',
    setTutorialDone: () => typeof window !== 'undefined' && localStorage.setItem('whirly_tutorial', 'true'),
};
