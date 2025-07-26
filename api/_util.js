import cryptojs from "crypto-js";

export const TOKEN = String(process.env.GITHUB_PAT);
export const ID = String(process.env.GITHUB_GIST_ID);

export const ACCESS_PASSWORD = String(process.env.ACCESS_PASSWORD);
export const ADMIN_PASSWORD = String(process.env.ADMIN_PASSWORD);

export function decrypt(msg, key) {
  return cryptojs.AES.decrypt(msg, key).toString(cryptojs.enc.Utf8);
}
export function encrypt(msg, key) {
  return cryptojs.AES.encrypt(msg, key).toString();
}

export function checkAuth(body) {
  if (typeof body == null) return null;
  if (typeof body !== "object") return null;
  if (typeof body.pwd_encrypted !== "string") return null;
  try {
    const pwdAccess = decrypt(body.pwd_encrypted, ACCESS_PASSWORD);
    const pwdAdmin = decrypt(body.pwd_encrypted, ADMIN_PASSWORD);
    if (pwdAccess === ACCESS_PASSWORD) return "user";
    if (pwdAdmin === ADMIN_PASSWORD) return "admin";
    return null;
  } catch (e) {
    return null;
  }
}

export async function readText() {
  console.log("reading text...");
  const resp = await fetch(`https://api.github.com/gists/${ID}`, {
    headers: {
      Authorization: `token ${TOKEN}`,
      Accept: "application/vnd.github+json",
    },
  });
  console.log("read text", resp.status);
  if (!resp.ok) throw new Error(resp.status);
  const gist = await resp.json();
  return gist.files["gistfile1.txt"].content;
}

export async function writeText(text) {
  console.log("writing text " + text.slice(0, 100) + "...");
  const body = {
    files: {
      "gistfile1.txt": {
        content: text,
      },
    },
  };
  const resp = await fetch(`https://api.github.com/gists/${ID}`, {
    method: "PATCH",
    headers: {
      Authorization: `token ${TOKEN}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  console.log("wrote text", resp.status);
  if (!resp.ok) throw new Error(resp.status);
}
