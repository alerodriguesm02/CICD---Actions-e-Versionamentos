// Arquivo: tests/server.test.js

import request from 'supertest';
// Certifique-se de que o caminho para o seu arquivo principal do servidor está correto
import server from '../server.js'; 

// Variável para guardar a instância do servidor e os dados de teste
let app;
let testItem;

// beforeAll: Roda UMA VEZ antes de todos os testes deste arquivo começarem.
// Ideal para iniciar o servidor.
beforeAll(() => {
  // Usamos uma porta diferente da padrão para evitar conflitos
  app = server.listen(3001); 
});

// afterAll: Roda UMA VEZ depois que todos os testes deste arquivo terminarem.
// Ideal para limpar recursos, como fechar o servidor.
afterAll((done) => {
  app.close(done);
});

// Bloco principal que agrupa os testes da API de Itens
describe("Items API", () => {

  // beforeEach: Roda ANTES DE CADA teste ('it') dentro deste bloco.
  // Perfeito para criar um estado inicial limpo para cada teste.
  beforeEach(async () => {
    // Criamos um item novo para cada teste, garantindo um ambiente limpo.
    const newItem = { name: `Item de Teste - ${Date.now()}` };
    const response = await request(app).post('/items').send(newItem);
    
    // Verificamos se o item foi realmente criado antes de prosseguir
    if (response.status !== 201) {
      throw new Error("Falha ao criar item de teste no beforeEach");
    }
    
    testItem = response.body; // Guardamos o item criado para usar nos testes
  });

  // afterEach: Roda DEPOIS DE CADA teste ('it') dentro deste bloco.
  // Essencial para limpar os dados criados e não deixar um teste interferir no outro.
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
    // Este teste agora vai passar, pois o beforeEach garante que existe pelo menos um item.
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("PUT /items/:id deve atualizar um item", async () => {
    const updatedData = { name: "Item Atualizado" };
    
    const res = await request(app)
      .put(`/items/${testItem.id}`) // Usamos o ID do item criado no beforeEach
      .send(updatedData);
      
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Item Atualizado");
  });

  it("DELETE /items/:id deve remover um item", async () => {
    const res = await request(app).delete(`/items/${testItem.id}`); // Usamos o ID
    
    expect(res.status).toBe(204); // Status 204 (No Content) é comum para DELETE bem-sucedido

    // Verificação extra: Tenta buscar o item deletado e espera um erro 404 (Not Found)
    const getResponse = await request(app).get(`/items/${testItem.id}`);
    expect(getResponse.status).toBe(404);
  });
});