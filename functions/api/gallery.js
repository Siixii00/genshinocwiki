export async function onRequestGet(context) {
    const { env } = context;
    
    try {
        const data = await env.GENSHIN_KV.get('gallery', { type: 'json' });
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
        const item = await request.json();
        const data = await env.GENSHIN_KV.get('gallery', { type: 'json' }) || [];
        
        item.id = Date.now().toString();
        item.createdAt = new Date().toISOString();
        data.unshift(item);
        
        await env.GENSHIN_KV.put('gallery', JSON.stringify(data));
        
        return new Response(JSON.stringify(item), {
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
        const data = await env.GENSHIN_KV.get('gallery', { type: 'json' }) || [];
        
        const index = data.findIndex(item => item.id === updates.id);
        if (index === -1) {
            return new Response(JSON.stringify({ error: 'Not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        data[index] = { ...data[index], ...updates, updatedAt: new Date().toISOString() };
        await env.GENSHIN_KV.put('gallery', JSON.stringify(data));
        
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
        
        const data = await env.GENSHIN_KV.get('gallery', { type: 'json' }) || [];
        const filtered = data.filter(item => item.id !== id);
        
        await env.GENSHIN_KV.put('gallery', JSON.stringify(filtered));
        
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
