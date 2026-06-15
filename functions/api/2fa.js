export async function onRequestGet(context) {
    const { env } = context;
    
    try {
        if (!env || !env.GENSHIN_KV) {
            return new Response(JSON.stringify({ secret: null }), {
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
        
        const secret = await env.GENSHIN_KV.get('totp_secret', { type: 'text' });
        return new Response(JSON.stringify({ secret: secret || null }), {
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (error) {
        return new Response(JSON.stringify({ secret: null }), {
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
        
        const { secret } = await request.json();
        
        if (!secret) {
            return new Response(JSON.stringify({ error: 'Secret required' }), {
                status: 400,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
        
        await env.GENSHIN_KV.put('totp_secret', secret);
        
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

export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    });
}