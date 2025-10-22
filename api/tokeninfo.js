import express from "express";
import fetch from "node-fetch";

const app = express();

app.get("/api/tokeninfo", async (req, res) => {
  const addr = req.query.addr;
  if (!addr) {
    return res.send("Please provide a valid token address using ?addr=0x...");
  }

  try {
    const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${addr}`);
    const data = await response.json();
    const pair = data.pairs?.[0];

    if (!pair) {
      return res.send("Token not found or no data available from Dexscreener.");
    }

    res.setHeader("Content-Type", "text/html");
    res.send(`
      <html>
        <head>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="https://quickchart.io/chart?c={type:'bar',data:{labels:['Price','24h%'],datasets:[{label:'Data',data:[${pair.priceUsd},${pair.priceChange.h24}]}]}}" />
          <meta property="fc:frame:button:1" content="View on Dexscreener" />
          <meta property="fc:frame:button:1:action" content="link" />
          <meta property="fc:frame:button:1:target" content="${pair.url}" />
        </head>
        <body style="font-family: monospace;">
          💰 <b>${pair.baseToken.name} (${pair.baseToken.symbol})</b><br/>
          💵 Price: $${pair.priceUsd}<br/>
          📉 24h Change: ${pair.priceChange.h24}%<br/>
          💧 Liquidity: $${pair.liquidity.usd}<br/>
          📊 Volume (24h): $${pair.volume.h24}<br/>
        </body>
      </html>
    `);
  } catch (error) {
    res.send("Error fetching data from Dexscreener API.");
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));

