// Arquivo: tests/server.test.js

import request from 'supertest';
import server from '../server.js'; 

let app;
let testItem;

// beforeAll: Inicia o servidor antes de todos os testes.
beforeAll(() => {
  app = server.listen(3001); 
});

// afterAll: Fecha o servidor depois de todos os testes, usando uma Promise para compatibilidade com o ESLint.
afterAll(() => {
  return new Promise((resolve) => {
    app.close(() => {
      resolve();
    });
  });
});

// Bloco principal que agrupa os testes da API de Itens
describe("Items API", () => {

  // beforeEach: Cria um item novo antes de cada teste.
  beforeEach(async () => {
    const newItem = { name: `Item de Teste - ${Date.now()}` };
    const response = await request(app).post('/items').send(newItem);
    
    if (response.status !== 201) {
      throw new Error("Falha ao criar item de teste no beforeEach");
    }
    
    testItem = response.body;
  });

  // afterEach: Limpa os dados criados depois de cada teste.
  afterEach(async () => {
    if (testItem && testItem.id) {
      await request(app).delete(`/items/${testItem.id}`);
    }
  });

  // --- Testes ---

  it("GET /health deve responder com status 200", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
  });

  it("GET /items deve listar ao menos 1 item", async () => {
    const res = await request(app).get("/items");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("PUT /items/:id deve atualizar um item", async () => {
    const updatedData = { name: "Item Atualizado" };
    
    const res = await request(app)
      .put(`/items/${testItem.id}`)
      .send(updatedData);
      
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Item Atualizado");
  });

  it("DELETE /items/:id deve remover um item", async () => {
    const res = await request(app).delete(`/items/${testItem.id}`);
    
    expect(res.status).toBe(204);

    const getResponse = await request(app).get(`/items/${testItem.id}`);
    expect(getResponse.status).toBe(404);
  });
});