import "dotenv/config";

const DEFAULT_MODEL =
  process.env.OPENROUTER_MODEL ||
  process.env.AI_MODEL ||
  "meta-llama/llama-3.2-3b-instruct:free";

const main = async () => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = DEFAULT_MODEL;

  if (!apiKey) {
    console.error("provider=openrouter status=error message=Missing OPENROUTER_API_KEY");
    process.exit(1);
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": (process.env.CLIENT_URL || "http://localhost:5173").split(",")[0].trim(),
        "X-Title": "SomuPilot AI",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: "Say hello in one sentence" }],
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error(
        `provider=openrouter model=${model} status=${response.status} message=${
          data?.error?.message || data?.message || "OpenRouter request failed"
        }`
      );
      process.exit(1);
    }

    const text = data?.choices?.[0]?.message?.content?.trim() || "";
    console.log(`provider=openrouter model=${model} status=${response.status}`);
    console.log(text || "OpenRouter returned an empty response");
  } catch (error) {
    console.error(
      `provider=openrouter model=${model} status=error message=${error?.message || "Unknown error"}`
    );
    process.exit(1);
  }
};

main();
