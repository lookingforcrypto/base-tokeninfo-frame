// Serverless function for Vercel
// Returns Farcaster Frame HTML with token info (English only)

export default async function handler(req, res) {
  const { addr } = req.query;
  if (!addr || !addr.startsWith("0x")) {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.status(400).send("Please provide a valid token address using ?addr=0x...");
  }

  try {
    const api = `https://api.dexscreener.com/latest/dex/tokens/${addr}`;
    const response = await fetch(api);
    if (!response.ok) {
      return res.status(502).send("Upstream API error from Dexscreener.");
    }
    const data = await response.json();
    const pair = data?.pairs?.[0];

    if (!pair) {
      return res.status(404).send("Token not found or no data available from Dexscreener.");
    }

    // Minimal chart (QuickChart) just for a visual; safe without API key
    const chartUrl =
      "https://quickchart.io/chart?c=" +
      encodeURIComponent(JSON.stringify({
        type: "bar",
        data: {
          labels: ["Price (USD)", "24h %"],
          datasets: [{ label: "Token", data: [Number(pair.priceUsd || 0), Number(pair.priceChange?.h24 || 0)] }]
        }
      }));

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(`
      <html>
        <head>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${chartUrl}" />
          <meta property="fc:frame:button:1" content="View on Dexscreener" />
          <meta property="fc:frame:button:1:action" content="link" />
          <meta property="fc:frame:button:1:target" content="${pair.url}" />
        </head>
        <body style="font-family: monospace;">
          💰 <b>${pair.baseToken?.name} (${pair.baseToken?.symbol})</b><br/>
          💵 Price: $${pair.priceUsd ?? "0"}<br/>
          📉 24h Change: ${pair.priceChange?.h24 ?? "0"}%<br/>
          💧 Liquidity: $${pair.liquidity?.usd ?? "0"}<br/>
          📊 Volume (24h): $${pair.volume?.h24 ?? "0"}<br/>
        </body>
      </html>
    `);
  } catch (err) {
    return res.status(500).send("Internal error while fetching token data.");
  }
}

