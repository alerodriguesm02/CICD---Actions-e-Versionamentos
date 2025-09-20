// tests/server.test.js
import request from 'supertest';
import server from '../server.js'; // Importe seu servidor/app

// Variável para guardar o servidor e os dados
let app;
let testItem;

// beforeAll é executado UMA VEZ antes de todos os testes neste arquivo
beforeAll(() => {
  app = server.listen(3001); // Inicia um servidor de teste em outra porta
});

// afterAll é executado UMA VEZ depois de todos os testes
afterAll((done) => {
  app.close(done); // Fecha o servidor para não deixar processos abertos
});

describe("Items API", () => {
  // beforeEach é executado ANTES DE CADA teste dentro deste describe
  beforeEach(async () => {
    // Vamos criar um item usando a API para garantir que ele existe
    const response = await request(app)
      .post('/items')
      .send({ name: 'Item de Teste' });

    testItem = response.body; // Salva o item criado para usar em outros testes
    expect(response.status).toBe(201); // Garante que o item foi criado
  });

  // OPCIONAL: Limpa os dados depois de cada teste para garantir isolamento
  afterEach(async () => {
    // Remove o item que criamos para que o próximo teste comece do zero
    if (testItem && testItem.id) {
      await request(app).delete(`/items/${testItem.id}`);
    }
  });

  it("GET /health deve responder ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
  });

  // AGORA ESTE TESTE VAI PASSAR!
  it("GET /items lista ao menos 1", async () => {
    const res = await request(app).get("/items");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // Como o beforeEach adicionou um item, o tamanho será maior que 0
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("PUT /items/:id atualiza item", async () => {
    const res = await request(app)
      .put(`/items/${testItem.id}`) // Usa o ID do item criado no beforeEach
      .send({ name: "Item Atualizado" });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Item Atualizado");
  });

  it("DELETE /items/:id remove item", async () => {
    const res = await request(app).delete(`/items/${testItem.id}`); // Usa o ID
    expect(res.status).toBe(204);
  });
});