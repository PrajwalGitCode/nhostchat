import fetch from "node-fetch";

export async function handler(event, context) {
  try {
    // 1. Parse request
    const { message } = JSON.parse(event.body);

    // 2. Check Nhost token from headers
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
      {
        headers: {
          "Authorization": `Bearer ${nhostToken}`
        }
      }
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

    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}
