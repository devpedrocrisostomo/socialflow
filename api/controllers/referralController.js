const prisma = require('../config/prisma');

const createReferral = async (req, res) => {
  const { familyId, destination, description, status, feedbackNotes } = req.body;
  const userId = req.user.id;

  if (!familyId || !destination || !description) {
    return res.status(400).json({ error: 'Família, Destino e Descrição são campos obrigatórios' });
  }

  try {
    const family = await prisma.family.findUnique({
      where: { id: parseInt(familyId) }
    });

    if (!family) {
      return res.status(404).json({ error: 'Família não encontrada' });
    }

    const referral = await prisma.referral.create({
      data: {
        familyId: parseInt(familyId),
        userId,
        destination,
        description,
        status: status || 'PENDING',
        feedbackNotes,
      },
    });

    // Notificar
    await prisma.notification.create({
      data: {
        userId,
        title: 'Novo Encaminhamento',
        message: `Encaminhamento criado para ${family.nameResponsible} com destino a: ${destination}.`,
        type: 'REFERRAL',
      }
    });

    res.status(201).json(referral);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar encaminhamento' });
  }
};

const getReferrals = async (req, res) => {
  const { familyId, status, destination, userId } = req.query;

  const where = {};

  if (familyId) where.familyId = parseInt(familyId);
  if (userId) where.userId = parseInt(userId);
  if (status) where.status = status;
  if (destination) where.destination = { contains: destination, mode: 'insensitive' };

  try {
    const referrals = await prisma.referral.findMany({
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

    res.json(referrals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar encaminhamentos' });
  }
};

const getReferralById = async (req, res) => {
  const { id } = req.params;

  try {
    const referral = await prisma.referral.findUnique({
      where: { id: parseInt(id) },
      include: {
        family: {
          select: { id: true, nameResponsible: true, cpf: true, phone: true }
        },
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!referral) {
      return res.status(404).json({ error: 'Encaminhamento não encontrado' });
    }

    res.json(referral);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar detalhes do encaminhamento' });
  }
};

const updateReferral = async (req, res) => {
  const { id } = req.params;
  const { destination, description, status, feedbackNotes } = req.body;

  try {
    const referral = await prisma.referral.findUnique({
      where: { id: parseInt(id) },
      include: { family: true }
    });

    if (!referral) {
      return res.status(404).json({ error: 'Encaminhamento não encontrado' });
    }

    const updated = await prisma.referral.update({
      where: { id: parseInt(id) },
      data: {
        destination,
        description,
        status,
        feedbackNotes,
      },
    });

    // Se o status mudou para RESOLVED, notificar
    if (status === 'RESOLVED' && referral.status !== 'RESOLVED') {
      await prisma.notification.create({
        data: {
          userId: referral.userId,
          title: 'Encaminhamento Resolvido',
          message: `O encaminhamento de ${referral.family.nameResponsible} para ${referral.destination} foi resolvido com sucesso!`,
          type: 'REFERRAL',
        }
      });
    }

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar encaminhamento' });
  }
};

const deleteReferral = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.referral.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Encaminhamento excluído com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao excluir encaminhamento' });
  }
};

module.exports = {
  createReferral,
  getReferrals,
  getReferralById,
  updateReferral,
  deleteReferral,
};
