// 在瀏覽器 Console 中執行此測試代碼
// 用於檢查 dishData 和 guide 的儲存與回填

async function testDishGuide() {
    console.log('=== 測試 dishData 和 guide 儲存/回填 ===\n');
    
    // 1. 取得當前角色資料
    const characters = await CharacterData.getAll();
    console.log('1. 所有角色:', characters);
    
    if (characters.length === 0) {
        console.error('沒有找到任何角色！');
        return;
    }
    
    const testChar = characters[0];
    console.log('\n2. 測試角色:', testChar.name, 'id:', testChar.id);
    console.log('   dishData:', testChar.dishData);
    console.log('   guide:', testChar.guide);
    
    // 2. 測試更新資料
    const testUpdate = {
        dishData: {
            name: '測試料理',
            originalDish: '原始料理',
            image: 'https://example.com/image.png',
            effect: '測試效果',
            description: '測試描述'
        },
        guide: {
            weapons: [{ name: '測試武器', image: '', reason: '測試原因' }],
            artifacts: [],
            teammates: [],
            talents: 'E > Q > A',
            notes: '測試備註'
        }
    };
    
    console.log('\n3. 準備更新的資料:', testUpdate);
    
    // 3. 執行更新
    const updated = await CharacterData.update(testChar.id, testUpdate);
    console.log('\n4. 更新後回傳的資料:', updated);
    console.log('   dishData:', updated?.dishData);
    console.log('   guide:', updated?.guide);
    
    // 4. 重新取得資料確認
    const reFetched = await CharacterData.getById(testChar.id);
    console.log('\n5. 重新取得的資料:', reFetched);
    console.log('   dishData:', reFetched?.dishData);
    console.log('   guide:', reFetched?.guide);
    
    // 5. 檢查 API 回傳的原始資料
    console.log('\n6. 直接呼叫 API 檢查原始資料...');
    const apiResult = await fetch(`/api/characters`).then(r => r.json());
    const apiChar = apiResult.find(c => c.id === testChar.id);
    console.log('   API 原始 dish_data:', apiChar?.dish_data);
    console.log('   API 原始 guide:', apiChar?.guide);
    
    return {
        original: testChar,
        updated: updated,
        reFetched: reFetched,
        apiRaw: apiChar
    };
}

// 執行測試
testDishGuide().then(result => {
    console.log('\n=== 測試完成 ===');
    console.log('結果:', result);
});
