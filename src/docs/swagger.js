const swaggerJsdoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API SGAS',
    version: '1.0.0',
    description:
      'API responsável pelos módulos de empresas, setores, avisos e pessoas do SGAS. Mantém o relacionamento entre matriz e filiais.',
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
          status: {
            type: 'integer',
            enum: [0, 1],
            description: '0 = inativo, 1 = ativo.',
          },
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
          status: {
            type: 'integer',
            enum: [0, 1],
            description: 'Define o status (1 = ativo, 0 = inativo).',
          },
        },
      },
      Pessoa: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          nome: { type: 'string' },
          cargo: { type: 'string', nullable: true },
          telefone: { type: 'string', nullable: true },
          email: { type: 'string', format: 'email' },
          company: { type: 'string' },
          branch: { type: 'string', nullable: true },
          status: {
            type: 'integer',
            enum: [0, 1],
            description: '0 = inativo, 1 = ativo.',
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      PessoaPayload: {
        type: 'object',
        required: ['nome', 'email', 'password', 'companyId'],
        properties: {
          nome: { type: 'string' },
          cargo: { type: 'string', nullable: true },
          telefone: { type: 'string', nullable: true },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', format: 'password' },
          companyId: { type: 'string' },
          branchId: {
            type: 'string',
            nullable: true,
            description: 'ID da filial. Quando vazio ou igual ao ID da empresa, assume-se a matriz.',
          },
          status: {
            type: 'integer',
            enum: [0, 1],
            description: 'Permite criar uma pessoa já inativa (padrão: 1).',
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
          status: {
            type: 'integer',
            enum: [0, 1],
            description: '0 = inativo, 1 = ativo.',
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
          status: {
            type: 'integer',
            enum: [0, 1],
            description: 'Define o status do setor (1 = ativo, 0 = inativo).',
          },
        },
      },
      Address: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          street: { type: 'string' },
          number: { type: 'string' },
          complement: { type: 'string', nullable: true },
          city: { type: 'string' },
          state: { type: 'string' },
          district: { type: 'string' },
          company: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              cnpj: { type: 'string' },
            },
          },
          status: {
            type: 'integer',
            enum: [0, 1],
            description: '0 = inativo, 1 = ativo.',
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      AddressPayload: {
        type: 'object',
        required: ['street', 'number', 'city', 'state', 'district', 'companyId'],
        properties: {
          street: { type: 'string' },
          number: { type: 'string' },
          complement: { type: 'string', nullable: true },
          city: { type: 'string' },
          state: { type: 'string' },
          district: { type: 'string' },
          companyId: { type: 'string', description: 'ID da empresa vinculada.' },
          status: {
            type: 'integer',
            enum: [0, 1],
            description: 'Define o status (1 = ativo, 0 = inativo).',
          },
        },
      },
      Notice: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          message: { type: 'string' },
          company: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              cnpj: { type: 'string' },
            },
          },
          sector: {
            type: 'object',
            nullable: true,
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
            },
          },
          expiresAt: { type: 'string', format: 'date-time', nullable: true },
          viewed: { type: 'boolean' },
          importance: { type: 'string' },
          status: {
            type: 'integer',
            enum: [0, 1],
            description: '0 = inativo, 1 = ativo.',
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      NoticePayload: {
        type: 'object',
        required: ['message', 'companyId'],
        properties: {
          message: { type: 'string' },
          companyId: { type: 'string', description: 'ID da empresa vinculada.' },
          sectorId: {
            type: 'string',
            nullable: true,
            description: 'ID do setor caso o aviso seja específico.',
          },
          expiresAt: { type: 'string', format: 'date-time', nullable: true },
          viewed: { type: 'boolean' },
          importance: { type: 'string' },
          status: {
            type: 'integer',
            enum: [0, 1],
            description: 'Define o status do aviso (1 = ativo, 0 = inativo).',
          },
        },
      },
    },
  },
  paths: {
    '/api/companies': {
      get: {
        summary: 'Lista todas as empresas',
        tags: ['Empresas'],
        parameters: [
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: ['0', '1', 'all'] },
            description: 'Filtra pelo status (1 = ativos, 0 = inativos, all = todos). Padrão: 1.',
          },
        ],
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
        parameters: [
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: ['0', '1', 'all'] },
            description: 'Filtra pelo status (padrão: 1).',
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
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: ['0', '1', 'all'] },
            description: 'Filtra pelo status (padrão: 1).',
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
    '/api/addresses': {
      get: {
        summary: 'Lista endereços cadastrados',
        tags: ['Endereços'],
        parameters: [
          {
            name: 'companyId',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filtra endereços por empresa.',
          },
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: ['0', '1', 'all'] },
            description: 'Filtra pelo status (padrão: 1).',
          },
        ],
        responses: {
          200: {
            description: 'Lista retornada com sucesso',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Address' } },
              },
            },
          },
        },
      },
      post: {
        summary: 'Cria um novo endereço vinculado a uma empresa',
        tags: ['Endereços'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AddressPayload' },
            },
          },
        },
        responses: {
          201: {
            description: 'Endereço criado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Address' },
              },
            },
          },
        },
      },
    },
    '/api/addresses/{addressId}': {
      parameters: [
        {
          name: 'addressId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
        },
      ],
      get: {
        summary: 'Busca um endereço pelo ID',
        tags: ['Endereços'],
        responses: {
          200: {
            description: 'Endereço encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Address' },
              },
            },
          },
          404: { description: 'Endereço não encontrado' },
        },
      },
      put: {
        summary: 'Atualiza os dados de um endereço',
        tags: ['Endereços'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AddressPayload' },
            },
          },
        },
        responses: {
          200: {
            description: 'Endereço atualizado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Address' },
              },
            },
          },
          404: { description: 'Endereço não encontrado' },
        },
      },
    },
    '/api/notices': {
      get: {
        summary: 'Lista avisos cadastrados',
        tags: ['Avisos'],
        parameters: [
          {
            name: 'companyId',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filtra avisos por empresa.',
          },
          {
            name: 'sectorId',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filtra avisos por setor.',
          },
          {
            name: 'viewed',
            in: 'query',
            schema: { type: 'boolean' },
            description: 'Quando informado, retorna apenas avisos visualizados/não visualizados.',
          },
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: ['0', '1', 'all'] },
            description: 'Filtra pelo status (padrão: 1).',
          },
        ],
        responses: {
          200: {
            description: 'Lista retornada com sucesso',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Notice' } },
              },
            },
          },
        },
      },
      post: {
        summary: 'Cria um novo aviso',
        tags: ['Avisos'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/NoticePayload' },
            },
          },
        },
        responses: {
          201: {
            description: 'Aviso criado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Notice' },
              },
            },
          },
        },
      },
    },
    '/api/notices/{noticeId}': {
      parameters: [
        {
          name: 'noticeId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
        },
      ],
      get: {
        summary: 'Busca um aviso pelo ID',
        tags: ['Avisos'],
        responses: {
          200: {
            description: 'Aviso encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Notice' },
              },
            },
          },
          404: { description: 'Aviso não encontrado' },
        },
      },
      put: {
        summary: 'Atualiza um aviso existente',
        tags: ['Avisos'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/NoticePayload' },
            },
          },
        },
        responses: {
          200: {
            description: 'Aviso atualizado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Notice' },
              },
            },
          },
          404: { description: 'Aviso não encontrado' },
        },
      },
    },
    '/api/auth/pessoas': {
      get: {
        summary: 'Lista as pessoas cadastradas',
        tags: ['Pessoas'],
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
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: ['0', '1', 'all'] },
            description: 'Filtra pelo status (padrão: 1).',
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
                    $ref: '#/components/schemas/Pessoa',
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Relaciona uma pessoa a uma empresa/filial',
        tags: ['Pessoas'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PessoaPayload' },
            },
          },
        },
        responses: {
          201: {
            description: 'Pessoa cadastrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Pessoa' },
              },
            },
          },
        },
      },
    },
    '/api/auth/pessoa/{id}': {
      get: {
        summary: 'Busca uma pessoa pelo ID',
        tags: ['Pessoas'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Pessoa encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Pessoa' },
              },
            },
          },
          404: { description: 'Pessoa não encontrada' },
        },
      },
    },
    '/api/auth/login/{companyId}': {
      post: {
        summary: 'Efetua o login informando empresa e filial',
        tags: ['Pessoas'],
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
