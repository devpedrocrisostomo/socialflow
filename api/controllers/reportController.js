const prisma = require('../config/prisma');

const createReport = async (req, res) => {
  const { familyId, title, type, content } = req.body;
  const userId = req.user.id;

  if (!familyId || !title || !type || !content) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }

  try {
    const family = await prisma.family.findUnique({
      where: { id: parseInt(familyId) }
    });

    if (!family) {
      return res.status(404).json({ error: 'Família não encontrada' });
    }

    const report = await prisma.report.create({
      data: {
        familyId: parseInt(familyId),
        userId,
        title,
        type,
        content,
      },
    });

    res.status(201).json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
};

const getReports = async (req, res) => {
  const { familyId, type, search } = req.query;

  const where = {};

  if (familyId) where.familyId = parseInt(familyId);
  if (type) where.type = type;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } },
    ];
  }

  try {
    const reports = await prisma.report.findMany({
      where,
      include: {
        family: {
          select: { id: true, nameResponsible: true, cpf: true }
        },
        user: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar relatórios' });
  }
};

const getReportById = async (req, res) => {
  const { id } = req.params;

  try {
    const report = await prisma.report.findUnique({
      where: { id: parseInt(id) },
      include: {
        family: {
          include: {
            members: true,
            appointments: { orderBy: { date: 'desc' }, take: 5 },
            visits: { orderBy: { date: 'desc' }, take: 5 },
            referrals: { orderBy: { createdAt: 'desc' }, take: 5 }
          }
        },
        user: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    });

    if (!report) {
      return res.status(404).json({ error: 'Relatório não encontrado' });
    }

    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar detalhes do relatório' });
  }
};

const updateReport = async (req, res) => {
  const { id } = req.params;
  const { title, type, content } = req.body;

  try {
    const report = await prisma.report.findUnique({
      where: { id: parseInt(id) }
    });

    if (!report) {
      return res.status(404).json({ error: 'Relatório não encontrado' });
    }

    const updated = await prisma.report.update({
      where: { id: parseInt(id) },
      data: {
        title,
        type,
        content,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar relatório' });
  }
};

const deleteReport = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.report.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Relatório excluído com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao excluir relatório' });
  }
};

module.exports = {
  createReport,
  getReports,
  getReportById,
  updateReport,
  deleteReport,
};
