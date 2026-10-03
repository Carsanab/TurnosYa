export default async function handler(req, res) {
  const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

  if (!GOOGLE_SCRIPT_URL) {
    return res.status(500).json({ message: "Variable GOOGLE_SCRIPT_URL no configurada" });
  }

  try {
    // Si la petición es GET (Consultar servicios, WhatsApp y horarios ocupados)
    if (req.method === "GET") {
      const { fecha } = req.query;
      const url = fecha ? `${GOOGLE_SCRIPT_URL}?fecha=${fecha}` : GOOGLE_SCRIPT_URL;
      
      const response = await fetch(url);
      const data = await response.json();

      return res.status(200).json(data);
    }

    // Si la petición es POST (Guardar nueva reserva)
    if (req.method === "POST") {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      });

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ message: "Método no permitido" });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.toString() });
  }
}