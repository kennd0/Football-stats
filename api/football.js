
export default async function handler(req, res) {
  const key = process.env.APISPORTS_KEY;

  if (!key) {
    return res.status(500).json({
      error: "Falta configurar APISPORTS_KEY en Vercel"
    });
  }

  const allowed = [
    "fixtures",
    "standings",
    "fixtures/headtohead",
    "fixtures/statistics",
    "fixtures/last"
  ];

  const endpoint = req.query.endpoint || "fixtures";

  if (!allowed.includes(endpoint)) {
    return res.status(400).json({ error: "Endpoint no permitido" });
  }

  const params = new URLSearchParams();

  for (const [k, v] of Object.entries(req.query)) {
    if (k !== "endpoint" && typeof v === "string") {
      params.set(k, v);
    }
  }

  const url =
    `https://v3.football.api-sports.io/${endpoint}?${params}`;

  try {
    const response = await fetch(url, {
      headers: { "x-apisports-key": key }
    });

    const data = await response.json();

    return res.status(response.status).json(data);
  } catch {
    return res.status(502).json({
      error: "Error conectando con API-Football"
    });
  }
}
