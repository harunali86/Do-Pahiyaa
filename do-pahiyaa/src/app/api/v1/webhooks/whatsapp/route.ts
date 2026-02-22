export const dynamic = 'force-dynamic';

/**
 * Handle Meta Webhook Verification (GET)
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    // fallback to hardcoded secret if env is not set
    const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN || "dopahiyaa_webhook_secret";

    console.log('Webhook GET Request:', { mode, token });

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('✅ Webhook verified!');
        return new Response(challenge, {
            status: 200,
            headers: { 'Content-Type': 'text/plain' }
        });
    }

    return new Response('Forbidden', { status: 403 });
}

/**
 * Handle Incoming Webhook Events (POST)
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log('📥 WABA Event:', JSON.stringify(body, null, 2));
        return new Response('EVENT_RECEIVED', { status: 200 });
    } catch (error) {
        return new Response('Invalid JSON', { status: 400 });
    }
}
