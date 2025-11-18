# API SGAS

Backend simples em Node.js + MongoDB que mantém os módulos de empresas, setores, avisos e login descritos no enunciado.

## Configuração

1. `cd api-sgas`
2. Copie o arquivo `.env.example` para `.env` e ajuste `MONGODB_URI` conforme seu ambiente.
3. Instale as dependências `npm install`.
4. Crie o banco de dados e as coleções básicos executando `npm run init:db` (requer um MongoDB ativo apontado pelo `MONGODB_URI`).

## Uso

- Ambiente de desenvolvimento: `npm run dev`
- Produção/local: `npm start`
- Acesse a documentação Swagger em `http://localhost:4000/docs` (porta configurável via `.env`).

## Endpoints principais

- `POST /api/companies` cria uma empresa (matriz ou filial).
- `GET /api/companies` lista empresas.
- `GET /api/companies/:id` obtém detalhes.
- `PUT /api/companies/:id` atualiza.
- `POST /api/auth/logins` relaciona um login (email/senha) com empresa/filial.
- `GET /api/auth/logins` lista logins cadastrados.
- `POST /api/auth/login/:companyId` executa login. Informe `branchId` no corpo; se ausente ou igual ao `companyId` o sistema assume a matriz.
- `POST /api/sectors` cria um setor vinculado a uma empresa.
- `GET /api/sectors` lista setores (pode filtrar por `companyId`).
- `GET /api/companies/:companyId/sectors` lista setores vinculados a uma empresa específica.
- `GET /api/sectors/:id` obtém detalhes do setor.
- `PUT /api/sectors/:id` atualiza o setor.
- `POST /api/notices` cria um aviso para empresa/setor.
- `GET /api/notices` lista avisos (pode filtrar por `companyId`, `sectorId` e `viewed`).
- `GET /api/notices/:id` obtém detalhes de um aviso.
- `PUT /api/notices/:id` atualiza aviso.
