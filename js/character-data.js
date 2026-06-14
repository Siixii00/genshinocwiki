const CharacterData = {
    STORAGE_KEY: 'genshin_characters',
    useApi: true,
    cachedCharacters: null,
    
    async init() {
        if (this.useApi && typeof ApiClient !== 'undefined') {
            try {
                this.cachedCharacters = await ApiClient.getCharacters();
            } catch (e) {
                console.warn('API unavailable, using localStorage');
                this.useApi = false;
                this.initLocalStorage();
            }
        } else {
            this.initLocalStorage();
        }
    },
    
    initLocalStorage() {
        if (!localStorage.getItem(this.STORAGE_KEY)) {
            this.saveAllLocal(this.getDefaultCharacters());
        }
    },
    
    getDefaultCharacters() {
        return [
            {
                id: '1',
                name: '鍾離',
                title: '塵世閒遊',
                fullname: '摩拉克斯',
                element: 'geo',
                weapon: 'polearm',
                region: 'liyue',
                rarity: 5,
                gender: 'male',
                vision: '岩',
                affiliation: '往生堂',
                constellation: '岩王帝君座',
                birthday: '12月31日',
                dish: '文火慢燉腌篤鮮',
                vaCn: '彭博',
                vaJp: '前野智昭',
                description: '璃月港往生堂客卿，知識淵博的紳士。',
                artwork: '',
                portrait: '',
                avatar: '',
                skills: {
                    normal: { name: '岩雨', description: '進行至多六段的長柄武器攻擊。' },
                    elemental: { name: '地心', description: '召喚岩脊造成岩元素傷害。' },
                    burst: { name: '天星', description: '降下巨大的隕石造成大量岩元素傷害。' }
                },
                constellations: [
                    { level: 1, name: '岩者，六合引之為骨', desc: '地心可同時存在兩座岩脊。' }
                ],
                story: '身份神秘的客卿，似乎對璃月的一切都瞭若指掌...'
            },
            {
                id: '2',
                name: '雷電將軍',
                title: '一心淨土',
                fullname: '雷電將軍',
                element: 'electro',
                weapon: 'polearm',
                region: 'inazuma',
                rarity: 5,
                gender: 'female',
                vision: '雷',
                affiliation: '稻妻幕府',
                constellation: '真珠座',
                birthday: '6月26日',
                dish: '',
                vaCn: '菊花花',
                vaJp: '澤城美雪',
                description: '稻妻幕府將軍，追求「永恆」的存在。',
                skills: {
                    normal: { name: '源流', description: '進行至多五段的連續攻擊。' },
                    elemental: { name: '神變·惡怒', description: '釋放雷元素造成傷害並獲得願力。' },
                    burst: { name: '奧義·夢想真說', description: '進入夢想一心狀態。' }
                },
                story: '雷之神，稻妻的最高統治者...'
            }
        ];
    },
    
    getAllLocal() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Error reading character data:', e);
            return [];
        }
    },
    
    async getAll() {
        if (this.useApi) {
            return this.cachedCharacters || await ApiClient.getCharacters();
        }
        return this.getAllLocal();
    },
    
    async getById(id) {
        const characters = await this.getAll();
        return characters.find(c => c.id === id) || null;
    },
    
    saveAllLocal(characters) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(characters));
            return true;
        } catch (e) {
            console.error('Error saving character data:', e);
            return false;
        }
    },
    
    async add(character) {
        if (this.useApi && typeof ApiClient !== 'undefined') {
            const added = await ApiClient.addCharacter(character);
            if (added) {
                this.cachedCharacters = await ApiClient.getCharacters();
            }
            return added;
        }
        
        const characters = this.getAllLocal();
        character.id = Date.now().toString();
        characters.push(character);
        return this.saveAllLocal(characters) ? character : null;
    },
    
    async update(id, updates) {
        if (this.useApi && typeof ApiClient !== 'undefined') {
            const updated = await ApiClient.updateCharacter(id, updates);
            if (updated) {
                this.cachedCharacters = await ApiClient.getCharacters();
            }
            return updated;
        }
        
        const characters = this.getAllLocal();
        const index = characters.findIndex(c => c.id === id);
        if (index === -1) return null;
        
        characters[index] = { ...characters[index], ...updates };
        return this.saveAllLocal(characters) ? characters[index] : null;
    },
    
    async delete(id) {
        if (this.useApi && typeof ApiClient !== 'undefined') {
            const result = await ApiClient.deleteCharacter(id);
            if (result.success) {
                this.cachedCharacters = await ApiClient.getCharacters();
            }
            return result.success;
        }
        
        const characters = this.getAllLocal();
        const filtered = characters.filter(c => c.id !== id);
        return this.saveAllLocal(filtered);
    },
    
    async filter(filters = {}) {
        let characters = await this.getAll();
        
        if (filters.search) {
            const search = filters.search.toLowerCase();
            characters = characters.filter(c => 
                c.name.toLowerCase().includes(search)
            );
        }
        
        if (filters.elements && filters.elements.length > 0) {
            characters = characters.filter(c => 
                filters.elements.includes(c.element)
            );
        }
        
        if (filters.weapons && filters.weapons.length > 0) {
            characters = characters.filter(c => 
                filters.weapons.includes(c.weapon)
            );
        }
        
        if (filters.regions && filters.regions.length > 0) {
            characters = characters.filter(c => 
                filters.regions.includes(c.region)
            );
        }
        
        return characters;
    },
    
    getElementName(element) {
        const names = {
            pyro: '火',
            anemo: '風',
            geo: '岩',
            electro: '雷',
            hydro: '水',
            cryo: '冰',
            dendro: '草'
        };
        return names[element] || element;
    },
    
    getWeaponName(weapon) {
        const names = {
            sword: '單手劍',
            claymore: '雙手劍',
            polearm: '長柄武器',
            bow: '弓',
            catalyst: '法器'
        };
        return names[weapon] || weapon;
    },
    
    getRegionName(region) {
        const names = {
            mondstadt: '蒙德',
            liyue: '璃月',
            inazuma: '稻妻',
            sumeru: '須彌',
            fontaine: '楓丹',
            natlan: '納塔',
            snezhnaya: '至冬',
            unknown: '未知'
        };
        return names[region] || region;
    }
};

if (typeof window !== 'undefined') {
    window.CharacterData = CharacterData;
}