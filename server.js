import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";

// --- OpenAPI 3.0 inline (poderia ser .yaml, mas o pedido foi 1 arquivo de server) ---
const openapi = {
  openapi: "3.0.3",
  info: { title: "Items API", version: "0.1.0" },
  servers: [{ url: "http://localhost:3000" }],
  paths: {
    "/items": {
      get: {
        summary: "Listar items",
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Item" } }
              }
            }
          }
        }
      },
      post: {
        summary: "Criar item",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/NewItem" }
            }
          }
        },
        responses: {
          "201": {
            description: "Criado",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Item" } } }
          },
          "400": { description: "Payload inválido" }
        }
      }
    },
    "/items/{id}": {
      get: {
        summary: "Obter item por id",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": {
            description: "OK",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Item" } } }
          },
          "404": { description: "Não encontrado" }
        }
      },
      put: {
        summary: "Atualizar item",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateItem" }
            }
          }
        },
        responses: {
          "200": { description: "Atualizado", content: { "application/json": { schema: { $ref: "#/components/schemas/Item" } } } },
          "404": { description: "Não encontrado" }
        }
      },
      delete: {
        summary: "Remover item",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "204": { description: "Removido" }, "404": { description: "Não encontrado" } }
      }
    }
  },
  components: {
    schemas: {
      Item: {
        type: "object",
        properties: { id: { type: "string" }, name: { type: "string" }, quantity: { type: "integer" } },
        required: ["id", "name", "quantity"]
      },
      NewItem: {
        type: "object",
        properties: { name: { type: "string" }, quantity: { type: "integer", minimum: 0 } },
        required: ["name", "quantity"]
      },
      UpdateItem: {
        type: "object",
        properties: { name: { type: "string" }, quantity: { type: "integer", minimum: 0 } }
      }
    }
  }
};

// --- App ---
const app = express();
app.use(cors());
app.use(express.json());

// banco em memória
const db = new Map(); // id -> { id, name, quantity }
let seq = 1;

// Swagger UI
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(openapi));

// Endpoints
app.get("/items", (req, res) => {
  res.json(Array.from(db.values()));
});

app.post("/items", (req, res) => {
  const { name, quantity } = req.body || {};
  if (typeof name !== "string" || !Number.isInteger(quantity) || quantity < 0) {
    return res.status(400).json({ error: "Payload inválido" });
  }
  const id = String(seq++);
  const item = { id, name, quantity };
  db.set(id, item);
  res.status(201).json(item);
});

app.get("/items/:id", (req, res) => {
  const item = db.get(req.params.id);
  if (!item) return res.status(404).json({ error: "Não encontrado" });
  res.json(item);
});

app.put("/items/:id", (req, res) => {
  const item = db.get(req.params.id);
  if (!item) return res.status(404).json({ error: "Não encontrado" });
  const { name, quantity } = req.body || {};
  const updated = {
    ...item,
    ...(typeof name === "string" ? { name } : {}),
    ...(Number.isInteger(quantity) && quantity >= 0 ? { quantity } : {})
  };
  db.set(req.params.id, updated);
  res.json(updated);
});

app.delete("/items/:id", (req, res) => {
  if (!db.has(req.params.id)) return res.status(404).json({ error: "Não encontrado" });
  db.delete(req.params.id);
  res.status(204).send();
});

// Healthcheck p/ testes
app.get("/health", (_req, res) => res.json({ ok: true }));

// Só inicia servidor quando executado diretamente (nos testes exportamos o app)
const PORT = process.env.PORT || 3000;
if (process.env.JEST_WORKER_ID === undefined) {
  app.listen(PORT, () => console.log(`API rodando em http://localhost:${PORT} | Swagger em /swagger`));
}

export default app;
