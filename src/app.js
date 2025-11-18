const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');
const companyRoutes = require('./routes/companyRoutes');
const authRoutes = require('./routes/authRoutes');
const sectorRoutes = require('./routes/sectorRoutes');
const noticeRoutes = require('./routes/noticeRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/companies', companyRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/sectors', sectorRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  const message = err.message || 'Erro interno do servidor.';
  res.status(status).json({ message });
});

module.exports = app;
