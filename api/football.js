
export default async function handler(req, res) {
  const token = process.env.FOOTBALL_DATA_TOKEN;

  if (!token) {
    return res.status(500).json({
      error: "Falta configurar FOOTBALL_DATA_TOKEN en Vercel"
    });
  }

  const path = req.query.path || "matches";

  const allowed =
    path === "matches" ||
    path === "competitions" ||
    /^competitions\/[A-Z0-9]{2,4}(\/(matches|standings|scorers))?$/.test(path) ||
    /^teams\/\d+\/matches$/.test(path);

  if (!allowed) {
    return res.status(400).json({
      error: "Ruta no permitida"
    });
  }

  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(req.query)) {
    if (
      key !== "path" &&
      key !== "utm_source" &&
      typeof value === "string"
    ) {
      params.set(key, value);
    }
  }

  const query = params.toString();
  const url =
    `https://api.football-data.org/v4/${path}` +
    (query ? `?${query}` : "");

  try {
    const response = await fetch(url, {
      headers: {
        "X-Auth-Token": token
      }
    });

    const data = await response.json();

    const cacheTime = path.includes("standings")
      ? 21600
      : path === "competitions"
      ? 86400
      : 900;

    res.setHeader(
      "Cache-Control",
      `public, s-maxage=${cacheTime}, stale-while-revalidate=60`
    );

    return res.status(response.status).json(data);

  } catch (error) {
    return res.status(502).json({
      error: "Error conectando con football-data.org"
    });
  }
}
