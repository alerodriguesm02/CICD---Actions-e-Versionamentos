import request from "supertest";
import app from "../server.js";

describe("Items API", () => {
  it("GET /health deve responder ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  //it("POST /items cria item", async () => {
  //  const res = await request(app).post("/items").send({ name: "caderno", quantity: 2 });
  //  expect(res.status).toBe(201);
  //  expect(res.body).toMatchObject({ name: "caderno", quantity: 2 });
  //  expect(res.body.id).toBeDefined();
  //});

  it("GET /items lista ao menos 1", async () => {
    const res = await request(app).get("/items");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("PUT /items/:id atualiza item", async () => {
    const created = await request(app).post("/items").send({ name: "lapis", quantity: 1 });
    const id = created.body.id;
    const updated = await request(app).put(`/items/${id}`).send({ quantity: 5 });
    expect(updated.status).toBe(200);
    expect(updated.body.quantity).toBe(5);
  });

  it("DELETE /items/:id remove item", async () => {
    const created = await request(app).post("/items").send({ name: "caneta", quantity: 3 });
    const id = created.body.id;
    const del = await request(app).delete(`/items/${id}`);
    expect(del.status).toBe(204);
    const get = await request(app).get(`/items/${id}`);
    expect(get.status).toBe(404);
  });
});
