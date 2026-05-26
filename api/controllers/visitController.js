const prisma = require('../config/prisma');

const createVisit = async (req, res) => {
  const { familyId, date, status, notes } = req.body;
  const userId = req.user.id;

  if (!familyId || !date) {
    return res.status(400).json({ error: 'Os campos Família e Data são obrigatórios' });
  }

  try {
    const family = await prisma.family.findUnique({
      where: { id: parseInt(familyId) }
    });

    if (!family) {
      return res.status(404).json({ error: 'Família não encontrada' });
    }

    const visit = await prisma.visit.create({
      data: {
        familyId: parseInt(familyId),
        userId,
        date: new Date(date),
        status: status || 'SCHEDULED',
        notes,
      },
    });

    // Criar notificação para o assistente social que agendou
    await prisma.notification.create({
      data: {
        userId,
        title: 'Nova Visita Agendada',
        message: `Uma visita domiciliar foi agendada para a família de ${family.nameResponsible} no dia ${new Date(date).toLocaleDateString('pt-BR')}.`,
        type: 'VISIT',
      }
    });

    res.status(201).json(visit);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao agendar visita' });
  }
};

const getVisits = async (req, res) => {
  const { familyId, status, startDate, endDate, userId } = req.query;

  const where = {};

  if (familyId) where.familyId = parseInt(familyId);
  if (userId) where.userId = parseInt(userId);
  if (status) where.status = status;
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate);
    if (endDate) where.date.lte = new Date(endDate);
  }

  try {
    const visits = await prisma.visit.findMany({
      where,
      include: {
        family: {
          select: { id: true, nameResponsible: true, cpf: true, address: true }
        },
        user: {
          select: { id: true, name: true }
        }
      },
      orderBy: { date: 'asc' }, // Ordena por data mais próxima primeiro
    });

    res.json(visits);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar visitas' });
  }
};

const getVisitById = async (req, res) => {
  const { id } = req.params;

  try {
    const visit = await prisma.visit.findUnique({
      where: { id: parseInt(id) },
      include: {
        family: {
          select: { id: true, nameResponsible: true, cpf: true, address: true, phone: true }
        },
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!visit) {
      return res.status(404).json({ error: 'Visita não encontrada' });
    }

    res.json(visit);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar detalhes da visita' });
  }
};

const updateVisit = async (req, res) => {
  const { id } = req.params;
  const { date, status, situationFound, photos, notes } = req.body;

  try {
    const visit = await prisma.visit.findUnique({
      where: { id: parseInt(id) },
      include: { family: true }
    });

    if (!visit) {
      return res.status(404).json({ error: 'Visita não encontrada' });
    }

    const updated = await prisma.visit.update({
      where: { id: parseInt(id) },
      data: {
        date: date ? new Date(date) : undefined,
        status,
        situationFound,
        photos,
        notes,
      },
    });

    // Se a visita foi concluída, enviar uma notificação de feedback
    if (status === 'COMPLETED' && visit.status !== 'COMPLETED') {
      await prisma.notification.create({
        data: {
          userId: visit.userId,
          title: 'Visita Concluída',
          message: `O relatório da visita para a família de ${visit.family.nameResponsible} foi registrado.`,
          type: 'VISIT',
        }
      });
    }

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar visita' });
  }
};

const deleteVisit = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.visit.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Visita excluída com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao excluir visita' });
  }
};

module.exports = {
  createVisit,
  getVisits,
  getVisitById,
  updateVisit,
  deleteVisit,
};
