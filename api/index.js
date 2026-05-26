require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares globais
app.use(cors());
app.use(express.json());

// Log de requisições simples
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Rotas da API
app.use('/api', apiRoutes);

// Rota base de status
app.get('/', (req, res) => {
  res.json({ message: 'SocialFlow API está rodando com sucesso!' });
});

// Middleware global de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Ocorreu um erro interno no servidor!' });
});

if (require.main === module || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

module.exports = app;
