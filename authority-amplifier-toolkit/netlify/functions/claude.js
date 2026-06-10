export default async (request) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return json({ error: 'Missing ANTHROPIC_API_KEY' }, 500);

    const { systemPrompt, userPrompt } = await request.json();
    if (!systemPrompt || !userPrompt) return json({ error: 'Missing prompt data' }, 400);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
        max_tokens: 1800,
        temperature: 0.4,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return json({ error: data?.error?.message || 'Anthropic request failed' }, response.status);
    }

    const text = data.content?.map((item) => item.text).join('\n') || '';
    return json({ text });
  } catch (error) {
    return json({ error: error.message || 'Connection error' }, 500);
  }
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' }
  });
}
