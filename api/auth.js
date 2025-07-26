import { checkAuth } from "./_util.js";

export default async function GET(req, res) {
  const body = req.query;
  try {
    const auth = checkAuth(body);
    if (auth == null)
      return res.json({
        success: false,
        reason: "password",
      });
    return res.json({
      success: true,
      auth,
    });
  } catch (e) {
    return res.json({
      success: false,
      reason: String(e.message),
    });
  }
}
