import fetch from "node-fetch";

export async function handler(event, context) {
  try {
    // 1. Parse request safely
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing request body" })
      };
    }

    let parsed;
    try {
      parsed = JSON.parse(event.body);
    } catch (err) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid JSON body" })
      };
    }

    const { message } = parsed;

    // 2. Check Nhost token
    const authHeader = event.headers.authorization;
    if (!authHeader) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Missing Authorization header" })
      };
    }
    const nhostToken = authHeader.split(" ")[1];

    // 3. Validate token with Nhost
    const nhostResponse = await fetch(
      "https://uroqldkdwwccgvomihii.auth.eu-central-1.nhost.run/v1/users/me",
      { headers: { Authorization: `Bearer ${nhostToken}` } }
    );

    if (!nhostResponse.ok) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Invalid Nhost token" })
      };
    }

    // 4. Call OpenRouter
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: message }]
      })
    });

    const data = await response.json();

    // 5. Extract clean reply
    const reply =
      data?.choices?.[0]?.message?.content ||
      data?.choices?.[0]?.text ||
      "Sorry, no response from AI.";

    return {
      statusCode: 200,
      body: JSON.stringify({ reply }) // only return clean reply
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}
