const prisma = require('../config/prisma');

const createAppointment = async (req, res) => {
  const { familyId, date, type, description, notes, attachments } = req.body;
  const userId = req.user.id; // Logged assistant

  if (!familyId || !date || !type || !description) {
    return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos' });
  }

  try {
    const family = await prisma.family.findUnique({
      where: { id: parseInt(familyId) }
    });

    if (!family) {
      return res.status(404).json({ error: 'Família não encontrada' });
    }

    const appointment = await prisma.appointment.create({
      data: {
        familyId: parseInt(familyId),
        userId,
        date: new Date(date),
        type,
        description,
        notes,
        attachments,
      },
    });

    res.status(201).json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao registrar atendimento' });
  }
};

const getAppointments = async (req, res) => {
  const { familyId, type, startDate, endDate, userId } = req.query;

  const where = {};

  if (familyId) where.familyId = parseInt(familyId);
  if (userId) where.userId = parseInt(userId);
  if (type) where.type = type;
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate);
    if (endDate) where.date.lte = new Date(endDate);
  }

  try {
    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        family: {
          select: { id: true, nameResponsible: true, cpf: true }
        },
        user: {
          select: { id: true, name: true, role: true }
        }
      },
      orderBy: { date: 'desc' },
    });

    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar atendimentos' });
  }
};

const getAppointmentById = async (req, res) => {
  const { id } = req.params;

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(id) },
      include: {
        family: {
          select: { id: true, nameResponsible: true, cpf: true, phone: true, address: true }
        },
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Atendimento não encontrado' });
    }

    res.json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar detalhes do atendimento' });
  }
};

const updateAppointment = async (req, res) => {
  const { id } = req.params;
  const { date, type, description, notes, attachments } = req.body;

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(id) }
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Atendimento não encontrado' });
    }

    const updated = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: {
        date: date ? new Date(date) : undefined,
        type,
        description,
        notes,
        attachments,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar atendimento' });
  }
};

const deleteAppointment = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.appointment.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Atendimento excluído com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao excluir atendimento' });
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
};
