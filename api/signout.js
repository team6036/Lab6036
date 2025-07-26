import { ADMIN_PASSWORD, readText, writeText } from "./_util.js";

export default async function handler(req, res) {
  const body = req.query;
  try {
    if (body.pwd !== ADMIN_PASSWORD)
      return res.json({
        success: false,
        reason: "password",
      });
    const name = body.name;
    if (typeof name !== "string") throw new TypeError();
    if (req.method === "POST") {
      console.log("sign out", name);
      const text = await readText();
      const data = JSON.parse(text.slice("header;".length));
      data.logEntries.push({ time: Date.now(), user: name, type: "out" });
      await writeText("header;" + JSON.stringify(data));
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
