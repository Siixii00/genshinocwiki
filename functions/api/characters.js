export async function onRequestGet(context) {
    const { env } = context;
    
    try {
        if (!env || !env.GENSHIN_KV) {
            return new Response(JSON.stringify([]), {
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
        
        const data = await env.GENSHIN_KV.get('characters', { type: 'json' });
        return new Response(JSON.stringify(data || []), {
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (error) {
        return new Response(JSON.stringify([]), {
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}

export async function onRequestPost(context) {
    const { env, request } = context;
    
    try {
        if (!env || !env.GENSHIN_KV) {
            return new Response(JSON.stringify({ error: 'KV not configured' }), {
                status: 503,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
        
        const character = await request.json();
        const data = await env.GENSHIN_KV.get('characters', { type: 'json' }) || [];
        
        character.id = Date.now().toString();
        character.createdAt = new Date().toISOString();
        data.push(character);
        
        await env.GENSHIN_KV.put('characters', JSON.stringify(data));
        
        return new Response(JSON.stringify(character), {
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}

export async function onRequestPut(context) {
    const { env, request } = context;
    
    try {
        if (!env || !env.GENSHIN_KV) {
            return new Response(JSON.stringify({ error: 'KV not configured' }), {
                status: 503,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
        
        const updates = await request.json();
        const data = await env.GENSHIN_KV.get('characters', { type: 'json' }) || [];
        
        const index = data.findIndex(c => c.id === updates.id);
        if (index === -1) {
            return new Response(JSON.stringify({ error: 'Not found' }), {
                status: 404,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
        
        data[index] = { ...data[index], ...updates, updatedAt: new Date().toISOString() };
        await env.GENSHIN_KV.put('characters', JSON.stringify(data));
        
        return new Response(JSON.stringify(data[index]), {
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}

export async function onRequestDelete(context) {
    const { env, request } = context;
    
    try {
        if (!env || !env.GENSHIN_KV) {
            return new Response(JSON.stringify({ error: 'KV not configured' }), {
                status: 503,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
        
        const url = new URL(request.url);
        const id = url.searchParams.get('id');
        
        if (!id) {
            return new Response(JSON.stringify({ error: 'ID required' }), {
                status: 400,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
        
        const data = await env.GENSHIN_KV.get('characters', { type: 'json' }) || [];
        const filtered = data.filter(c => c.id !== id);
        
        await env.GENSHIN_KV.put('characters', JSON.stringify(filtered));
        
        return new Response(JSON.stringify({ success: true }), {
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}