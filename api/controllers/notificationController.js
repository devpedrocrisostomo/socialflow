const prisma = require('../config/prisma');

const getNotifications = async (req, res) => {
  const userId = req.user.id;

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false }
    });

    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar notificações' });
  }
};

const markAsRead = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const notification = await prisma.notification.findUnique({
      where: { id: parseInt(id) }
    });

    if (!notification || notification.userId !== userId) {
      return res.status(404).json({ error: 'Notificação não encontrada' });
    }

    const updated = await prisma.notification.update({
      where: { id: parseInt(id) },
      data: { isRead: true },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao marcar notificação como lida' });
  }
};

const markAllAsRead = async (req, res) => {
  const userId = req.user.id;

  try {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });

    res.json({ message: 'Todas as notificações foram marcadas como lidas' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao marcar todas as notificações' });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};
