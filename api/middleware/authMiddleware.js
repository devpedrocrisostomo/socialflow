const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido ou inválido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'socialflow_secret_key_2026_super_secure');
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, name: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Usuário associado ao token não existe mais' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ error: 'Acesso negado. Requer privilégios de Administrador.' });
  }
};

module.exports = { authMiddleware, isAdmin };
