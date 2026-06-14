export async function onRequestGet(context) {
    const { env } = context;
    
    try {
        const data = await env.GENSHIN_KV.get('characters', { type: 'json' });
        return new Response(JSON.stringify(data || []), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestPost(context) {
    const { env, request } = context;
    
    try {
        const character = await request.json();
        const data = await env.GENSHIN_KV.get('characters', { type: 'json' }) || [];
        
        character.id = Date.now().toString();
        character.createdAt = new Date().toISOString();
        data.push(character);
        
        await env.GENSHIN_KV.put('characters', JSON.stringify(data));
        
        return new Response(JSON.stringify(character), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestPut(context) {
    const { env, request } = context;
    
    try {
        const updates = await request.json();
        const data = await env.GENSHIN_KV.get('characters', { type: 'json' }) || [];
        
        const index = data.findIndex(c => c.id === updates.id);
        if (index === -1) {
            return new Response(JSON.stringify({ error: 'Not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        data[index] = { ...data[index], ...updates, updatedAt: new Date().toISOString() };
        await env.GENSHIN_KV.put('characters', JSON.stringify(data));
        
        return new Response(JSON.stringify(data[index]), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestDelete(context) {
    const { env, request } = context;
    
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get('id');
        
        if (!id) {
            return new Response(JSON.stringify({ error: 'ID required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const data = await env.GENSHIN_KV.get('characters', { type: 'json' }) || [];
        const filtered = data.filter(c => c.id !== id);
        
        await env.GENSHIN_KV.put('characters', JSON.stringify(filtered));
        
        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
