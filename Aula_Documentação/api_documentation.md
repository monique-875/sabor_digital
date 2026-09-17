# Contrato da API Sabor Digital

Contrato de integração para o back-end localizado em `src/`.

## 1. Visão geral

- **Base URL local:** `http://localhost:3000`
- **Documentação interativa:** `GET /api-docs`
- **Formato padrão:** JSON, exceto nas operações de produto que recebem imagem.
- **CORS:** habilitado pelo servidor.
- **Identificador:** os IDs são numéricos e correspondem aos registros do banco.

As rotas são registradas diretamente na raiz. Portanto, os caminhos abaixo não possuem prefixo adicional como `/api`.

## 2. Autenticação

O login retorna um token JWT. Nas rotas protegidas, envie:

```http
Authorization: Bearer <token>
```

### Permissões

| Grupo                                   | Autenticação | Papel exigido                |
| --------------------------------------- | -----------: | ---------------------------- |
| `/auth/*`                               |          Não | Nenhum                       |
| `GET /usuarios/me`                      |          Sim | Qualquer usuário autenticado |
| `GET /produtos` e `GET /produtos/:id`   |          Não | Nenhum                       |
| `POST`, `PUT` e `DELETE /produtos`      |          Sim | `admin`                      |
| `GET /cardapios` e `GET /cardapios/:id` |          Não | Nenhum                       |
| `POST` e `DELETE /cardapios`            |          Sim | `admin`                      |
| `/pedidos/*`                            |          Não | Nenhum                       |

Respostas de autenticação:

```json
{ "erro": "Token não informado." }
```

```json
{ "erro": "Token inválido ou expirado." }
```

```json
{ "erro": "Você não tem permissão para acessar este recurso." }
```

Os status correspondentes são `401`, `403` e `403`.

## 3. Endpoint de status

### `GET /`

Indica que a API está disponível.

**Resposta `200 OK`:**

```json
{
  "mensagem": "API SaborDigital funcionando 🍝",
  "versao": "1.0.0",
  "arquitetura": "MVC + SOLID (Refatorada)"
}
```

## 4. Usuários e autenticação

### `POST /auth/registrar` ou `POST /usuarios/registrar`

Cria um usuário. O campo `papel` é opcional; quando omitido, o banco utiliza `cliente`.

**Corpo:**

```json
{
  "nome": "Maria Silva",
  "email": "maria@exemplo.com",
  "senha": "123456",
  "papel": "cliente"
}
```

Campos obrigatórios: `nome`, `email` e `senha`.

**Resposta `201 Created`:**

```json
{
  "mensagem": "Usuário cadastrado com sucesso",
  "usuario": {
    "id": 1,
    "nome": "Maria Silva",
    "email": "maria@exemplo.com",
    "papel": "cliente",
    "criado_em": "2026-09-17T12:00:00.000Z"
  }
}
```

Possíveis erros: `400` para campos ausentes ou e-mail duplicado.

### `POST /auth/login` ou `POST /usuarios/login`

Autentica um usuário e gera o JWT.

**Corpo:**

```json
{
  "email": "maria@exemplo.com",
  "senha": "123456"
}
```

**Resposta `200 OK`:**

```json
{
  "token": "<jwt>",
  "usuario": {
    "id": 1,
    "nome": "Maria Silva",
    "email": "maria@exemplo.com",
    "papel": "cliente"
  }
}
```

Possíveis erros: `400` para campos ausentes e `401` para credenciais inválidas.

### `GET /usuarios/me`

Retorna os dados do usuário associado ao token. Exige autenticação.

**Resposta `200 OK`:**

```json
{
  "id": 1,
  "nome": "Maria Silva",
  "email": "maria@exemplo.com",
  "papel": "cliente",
  "criado_em": "2026-09-17T12:00:00.000Z"
}
```

## 5. Produtos

### `GET /produtos`

Lista todos os produtos, ordenados do ID mais recente para o mais antigo.

**Resposta `200 OK`:**

```json
{
  "sucesso": true,
  "dados": [
    {
      "id": 1,
      "nome": "Espaguete à Bolonhesa",
      "descricao": "Massa com molho de tomate e carne moída",
      "preco": "35.50",
      "categoria": "Massa",
      "imagem": "/public/uploads/produtos/1684321234-foto.jpg",
      "disponivel": 1,
      "criado_em": "2026-09-17T12:00:00.000Z",
      "atualizado_em": "2026-09-17T12:00:00.000Z"
    }
  ],
  "total": 1
}
```

`imagem` é `null` quando o produto não possui arquivo. Para exibir uma imagem, concatene o caminho à Base URL.

### `GET /produtos/:id`

Busca um produto pelo ID.

**Resposta `200 OK`:** `{ "sucesso": true, "dados": { ...produto } }`

Erros: `400` para ID inválido e `404` quando o produto não existe.

### `POST /produtos`

Cadastra um produto. Exige JWT de usuário com papel `admin` e usa `multipart/form-data`.

| Campo        | Tipo     | Obrigatório | Observação                                  |
| ------------ | -------- | ----------: | ------------------------------------------- |
| `nome`       | texto    |         Sim | Nome do produto                             |
| `descricao`  | texto    |         Sim | Descrição                                   |
| `preco`      | número   |         Sim | Deve ser maior que zero                     |
| `categoria`  | texto    |         Não | Categoria do produto                        |
| `disponivel` | booleano |         Não | Padrão: `true`; em FormData, aceita `false` |
| `imagem`     | arquivo  |         Não | JPEG ou PNG, enviado no campo `imagem`      |

**Resposta `201 Created`:**

```json
{
  "sucesso": true,
  "mensagem": "Produto cadastrado com sucesso",
  "id": 5
}
```

### `PUT /produtos/:id`

Atualiza um produto. Exige admin e usa `multipart/form-data`. Todos os campos são opcionais; envie ao menos um campo válido. A imagem nova substitui a anterior.

**Resposta `200 OK`:**

```json
{ "sucesso": true, "mensagem": "Produto atualizado com sucesso" }
```

Erros: `400` para ID/dados inválidos e `404` quando o produto não existe.

### `DELETE /produtos/:id`

Remove um produto. Exige admin.

**Resposta `200 OK`:**

```json
{ "sucesso": true, "mensagem": "Produto apagado com sucesso" }
```

## 6. Cardápios

### `GET /cardapios`

Lista os cardápios.

**Resposta `200 OK`:** `{ "sucesso": true, "dados": [ ... ], "total": 1 }`

### `GET /cardapios/:id`

Busca um cardápio e inclui os produtos vinculados na propriedade `produtos`.

**Resposta `200 OK`:**

```json
{
  "sucesso": true,
  "dados": {
    "id": 1,
    "nome": "Menu Executivo",
    "descricao": "Almoço individual",
    "disponivel": 1,
    "produtos": [
      {
        "id": 1,
        "nome": "Espaguete à Bolonhesa",
        "descricao": "Massa com molho de tomate e carne moída",
        "preco": "35.50",
        "categoria": "Massa",
        "imagem": null,
        "disponivel": 1
      }
    ]
  }
}
```

Erros: `400` para ID inválido e `404` quando o cardápio não existe.

### `POST /cardapios`

Cria um cardápio. Exige admin e recebe JSON.

```json
{
  "nome": "Menu Executivo",
  "descricao": "Almoço individual",
  "disponivel": true,
  "produtos": [1, 4]
}
```

`nome` e `produtos` são obrigatórios. `produtos` deve ser um array com pelo menos um ID existente. IDs duplicados são removidos.

**Resposta `201 Created`:**

```json
{
  "sucesso": true,
  "mensagem": "Cardápio cadastrado com sucesso",
  "id": 2
}
```

### `DELETE /cardapios/:id`

Remove o cardápio e seus vínculos. Exige admin; os produtos não são removidos.

**Resposta `200 OK`:**

```json
{ "sucesso": true, "mensagem": "Cardápio apagado com sucesso" }
```

## 7. Pedidos

As rotas de pedidos não exigem JWT no código atual.

### `POST /pedidos`

Cria um pedido. O total é calculado no back-end usando os preços atuais dos produtos; não envie `total`.

```json
{
  "cliente": "João da Silva",
  "itens": [
    { "produto_id": 1, "quantidade": 2 },
    { "produto_id": 4, "quantidade": 1 }
  ]
}
```

Cada item deve possuir `produto_id` e `quantidade` maior que zero. Produtos indisponíveis não podem ser pedidos.

**Resposta `201 Created`:**

```json
{
  "mensagem": "Pedido criado com sucesso",
  "pedido": {
    "id": 10,
    "cliente": "João da Silva",
    "status": "pendente",
    "total": "83.00",
    "criado_em": "2026-09-17T12:00:00.000Z",
    "atualizado_em": "2026-09-17T12:00:00.000Z",
    "itens": [
      {
        "id": 20,
        "pedido_id": 10,
        "produto_id": 1,
        "quantidade": 2,
        "preco_unitario": "35.50",
        "produto_nome": "Espaguete à Bolonhesa",
        "produto_descricao": "Massa com molho de tomate e carne moída"
      }
    ]
  }
}
```

### `GET /pedidos`

Lista os pedidos, sem os itens detalhados.

**Resposta `200 OK`:** array de pedidos com `id`, `cliente`, `status`, `total`, `criado_em` e `atualizado_em`.

### `GET /pedidos/:id`

Busca um pedido com a lista de itens e os dados básicos de cada produto.

**Resposta `200 OK`:** objeto de pedido com `itens`, conforme o exemplo de criação.

### `PATCH /pedidos/:id/status`

Atualiza apenas o status do pedido.

```json
{ "status": "preparo" }
```

Valores aceitos: `pendente`, `preparo`, `pronto` e `entregue`.

**Resposta `200 OK`:**

```json
{
  "mensagem": "Status atualizado com sucesso",
  "pedido": { "id": 10, "status": "preparo" }
}
```

### `DELETE /pedidos/:id`

Exclui o pedido e seus itens relacionados.

**Resposta `200 OK`:**

```json
{ "mensagem": "Pedido excluído com sucesso" }
```

## 8. Convenção de erros

Os controladores retornam JSON, mas o envelope varia conforme o módulo:

- autenticação, usuários e pedidos: `{ "erro": "mensagem" }`;
- produtos e cardápios: `{ "sucesso": false, "mensagem": "mensagem", "erro": "..." }`;
- validação de pedido: `400`;
- recurso inexistente: normalmente `404`;
- falha inesperada: normalmente `500`.

O cliente deve usar o status HTTP como fonte principal e exibir `mensagem` quando existir; como fallback, usar `erro`.

## 9. Arquivos estáticos

Imagens enviadas para produtos ficam disponíveis em:

```text
GET /public/uploads/produtos/<nome-do-arquivo>
```

Exemplo completo: `http://localhost:3000/public/uploads/produtos/1684321234-foto.jpg`.
