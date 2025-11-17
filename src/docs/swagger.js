const swaggerJsdoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API SGAS',
    version: '1.0.0',
    description:
      'API responsável pelos módulos de empresas, setores e login do SGAS. Mantém o relacionamento entre matriz e filiais.',
  },
  servers: [
    {
      url: 'http://localhost:{port}',
      description: 'Servidor local',
      variables: {
        port: {
          enum: ['4000', '3000'],
          default: '4000',
        },
      },
    },
  ],
  components: {
    schemas: {
      Company: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          legalName: { type: 'string' },
          cnpj: { type: 'string' },
          stateRegistration: { type: 'string' },
          municipalRegistration: { type: 'string' },
          activity: { type: 'string' },
          phones: { type: 'array', items: { type: 'string' } },
          emails: { type: 'array', items: { type: 'string' } },
          matrixCompany: { type: 'string', nullable: true },
          isMatrix: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CompanyPayload: {
        type: 'object',
        required: ['name', 'cnpj'],
        properties: {
          name: { type: 'string' },
          legalName: { type: 'string' },
          cnpj: { type: 'string' },
          stateRegistration: { type: 'string' },
          municipalRegistration: { type: 'string' },
          activity: { type: 'string' },
          phones: { type: 'array', items: { type: 'string' } },
          emails: { type: 'array', items: { type: 'string' } },
          matrixCompany: {
            type: 'string',
            description: 'ID da matriz. Caso vazio, a empresa é matriz ou não possui filiais.',
          },
        },
      },
      LoginCredential: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string', format: 'email' },
          company: { type: 'string' },
          branch: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      LoginCredentialPayload: {
        type: 'object',
        required: ['email', 'password', 'companyId'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', format: 'password' },
          companyId: { type: 'string' },
          branchId: {
            type: 'string',
            nullable: true,
            description: 'ID da filial. Quando vazio ou igual ao ID da empresa, assume-se a matriz.',
          },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', format: 'password' },
          branchId: {
            type: 'string',
            nullable: true,
            description: 'ID da filial enviado no corpo. Se ausente assume a matriz.',
          },
        },
      },
      LoginResponse: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          companyId: { type: 'string' },
          branchId: { type: 'string' },
          matriz: { type: 'boolean' },
        },
      },
      Sector: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          technicalManager: { type: 'string' },
          responsible: { type: 'string' },
          phone: { type: 'string' },
          email: { type: 'string' },
          address: { type: 'string' },
          sectorType: { type: 'string' },
          manager: { type: 'string' },
          description: { type: 'string' },
          company: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              cnpj: { type: 'string' },
            },
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      SectorPayload: {
        type: 'object',
        required: ['name', 'companyId'],
        properties: {
          name: { type: 'string' },
          technicalManager: { type: 'string' },
          responsible: { type: 'string' },
          phone: { type: 'string' },
          email: { type: 'string', format: 'email' },
          address: { type: 'string' },
          sectorType: { type: 'string' },
          manager: { type: 'string' },
          description: { type: 'string' },
          companyId: { type: 'string', description: 'ID da empresa vinculada.' },
        },
      },
    },
  },
  paths: {
    '/api/companies': {
      get: {
        summary: 'Lista todas as empresas',
        tags: ['Empresas'],
        responses: {
          200: {
            description: 'Lista retornada com sucesso',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Company' } },
              },
            },
          },
        },
      },
      post: {
        summary: 'Cria uma nova empresa',
        tags: ['Empresas'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CompanyPayload' },
            },
          },
        },
        responses: {
          201: {
            description: 'Empresa criada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Company' },
              },
            },
          },
        },
      },
    },
    '/api/companies/{companyId}': {
      parameters: [
        {
          name: 'companyId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
        },
      ],
      get: {
        summary: 'Busca empresa pelo ID',
        tags: ['Empresas'],
        responses: {
          200: {
            description: 'Empresa encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Company' },
              },
            },
          },
          404: { description: 'Empresa não encontrada' },
        },
      },
      put: {
        summary: 'Atualiza uma empresa',
        tags: ['Empresas'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CompanyPayload' },
            },
          },
        },
        responses: {
          200: {
            description: 'Empresa atualizada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Company' },
              },
            },
          },
        },
      },
    },
    '/api/companies/{companyId}/sectors': {
      parameters: [
        {
          name: 'companyId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'ID da empresa cujos setores serão listados.',
        },
      ],
      get: {
        summary: 'Lista setores vinculados a uma empresa específica',
        tags: ['Setores'],
        responses: {
          200: {
            description: 'Lista retornada com sucesso',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Sector' } },
              },
            },
          },
          404: { description: 'Empresa informada não encontrada.' },
        },
      },
    },
    '/api/sectors': {
      get: {
        summary: 'Lista os setores cadastrados',
        tags: ['Setores'],
        parameters: [
          {
            name: 'companyId',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filtra setores por empresa.',
          },
        ],
        responses: {
          200: {
            description: 'Lista retornada com sucesso',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Sector' } },
              },
            },
          },
        },
      },
      post: {
        summary: 'Cria um novo setor vinculado a uma empresa',
        tags: ['Setores'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SectorPayload' },
            },
          },
        },
        responses: {
          201: {
            description: 'Setor criado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Sector' },
              },
            },
          },
        },
      },
    },
    '/api/sectors/{sectorId}': {
      parameters: [
        {
          name: 'sectorId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
        },
      ],
      get: {
        summary: 'Busca um setor pelo ID',
        tags: ['Setores'],
        responses: {
          200: {
            description: 'Setor encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Sector' },
              },
            },
          },
          404: { description: 'Setor não encontrado' },
        },
      },
      put: {
        summary: 'Atualiza os dados de um setor existente',
        tags: ['Setores'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SectorPayload' },
            },
          },
        },
        responses: {
          200: {
            description: 'Setor atualizado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Sector' },
              },
            },
          },
          404: { description: 'Setor não encontrado' },
        },
      },
    },
    '/api/auth/logins': {
      get: {
        summary: 'Lista os logins cadastrados',
        tags: ['Login'],
        parameters: [
          {
            name: 'companyId',
            in: 'query',
            schema: { type: 'string' },
          },
          {
            name: 'branchId',
            in: 'query',
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Lista retornada com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/LoginCredential',
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Relaciona um login a uma empresa/filial',
        tags: ['Login'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginCredentialPayload' },
            },
          },
        },
        responses: {
          201: {
            description: 'Login cadastrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginCredential' },
              },
            },
          },
        },
      },
    },
    '/api/auth/login/{companyId}': {
      post: {
        summary: 'Efetua o login informando empresa e filial',
        tags: ['Login'],
        parameters: [
          {
            name: 'companyId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'ID da empresa enviado como parâmetro da rota.',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Login efetuado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginResponse' },
              },
            },
          },
          401: { description: 'Credenciais inválidas' },
        },
      },
    },
  },
};

const swaggerOptions = {
  definition: swaggerDefinition,
  apis: [],
};

module.exports = swaggerJsdoc(swaggerOptions);
