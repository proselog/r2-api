const randomId = () => crypto.randomUUID()

const getExtension = (path: string) => {
  const lastPart = path.split(".").pop()
  return lastPart ? `.${lastPart}` : ""
}

const json = (data: any) =>
  new Response(JSON.stringify(data), {
    headers: {
      "content-type": "application/json",
    },
  })

const handler: ExportedHandler<{ BUCKET: R2Bucket; API_TOKEN: string }> = {
  async fetch(request, env): Promise<Response> {
    try {
      // Files are publicly accessible
      if (request.method === "GET") {
        const url = new URL(request.url)

        if (url.pathname === "/") {
          return new Response("hello world")
        }

        const key = url.pathname.substring(1)
        const object = await env.BUCKET.get(key)
        if (!object) {
          return new Response("object not found", { status: 404 })
        }
        return new Response(object.body)
      }

      if (request.method === "POST") {
        const token = request.headers
          .get("authorization")
          ?.replace("Bearer ", "")

        if (token !== env.API_TOKEN) {
          return new Response("invalid token", {
            status: 401,
          })
        }

        const data = await request.formData()
        const id = randomId()
        const prefix = data.get("prefix")
        const file = data.get("file") as File

        if (!file || !(file instanceof File)) {
          throw new Error("missing file or invalid file")
        }

        if (prefix && typeof prefix !== "string") {
          throw new Error("prefix must be a string")
        }

        const key = `${prefix || ""}${id}${getExtension(file.name)}`

        await env.BUCKET.put(key, await file.arrayBuffer(), {
          httpMetadata: {
            contentType: file.type,
          },
        })
        return json({ key })
      }
    } catch (error: any) {
      return new Response(error.message, { status: 500 })
    }

    return new Response("Hello World!")
  },
}

export default handler
