import { getDerivedKey, encrypt, decrypt } from "@proselog/jwt"

const key = await getDerivedKey("xxx")
const token = await encrypt({ prefix: "some_prefix" }, key, { expiresIn: "1h" })

console.log(token)
