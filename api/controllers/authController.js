const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ error: 'Credenciais inválidas' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'socialflow_secret_key_2026_super_secure',
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'E-mail já está em uso' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao cadastrar usuário' });
  }
};

const getProfile = async (req, res) => {
  res.json(req.user);
};

const updateProfile = async (req, res) => {
  const { name, password, email } = req.body;
  const userId = req.user.id;

  try {
    const updateData = {};
    if (name) updateData.name = name;
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: { email, NOT: { id: userId } }
      });
      if (existingUser) {
        return res.status(400).json({ error: 'E-mail já está em uso por outro usuário' });
      }
      updateData.email = email;
    }
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: { name: 'asc' },
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
};

module.exports = {
  login,
  registerUser,
  getProfile,
  updateProfile,
  getAllUsers,
};
