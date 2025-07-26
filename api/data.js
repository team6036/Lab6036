import {
  ACCESS_PASSWORD,
  ADMIN_PASSWORD,
  checkAuth,
  encrypt,
  readText,
  writeText,
} from "./_util.js";

export default async function handler(req, res) {
  const body = req.query;
  try {
    const auth = checkAuth(body);
    if (!auth)
      return res.json({
        success: false,
        reason: "password",
      });
    if (req.method === "GET") {
      const data = await readText();
      return res.json({
        success: true,
        data: encrypt(data, auth === "user" ? ACCESS_PASSWORD : ADMIN_PASSWORD),
      });
    }
    if (req.method === "POST" && auth === "admin") {
      const data = String(req.body);
      await writeText(data);
      return res.json({
        success: true,
      });
    }
    throw req.method;
  } catch (e) {
    return res.json({
      success: false,
      reason: String(e.message),
    });
  }
}
