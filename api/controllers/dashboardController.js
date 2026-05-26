const prisma = require('../config/prisma');

const getDashboardStats = async (req, res) => {
  try {
    // 1. Total de famílias cadastradas
    const totalFamilies = await prisma.family.count();

    // 2. Atendimentos do mês atual
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const appointmentsThisMonth = await prisma.appointment.count({
      where: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    });

    // 3. Casos em acompanhamento crítico
    const criticalCases = await prisma.family.count({
      where: {
        socialSituation: 'CRITICAL'
      }
    });

    // 4. Encaminhamentos pendentes
    const pendingReferrals = await prisma.referral.count({
      where: {
        status: 'PENDING'
      }
    });

    // 5. Dados para Gráficos
    // 5.1 Distribuição por Situação Social
    const situationCounts = await prisma.family.groupBy({
      by: ['socialSituation'],
      _count: {
        id: true
      }
    });

    const socialSituationData = situationCounts.map(item => ({
      name: item.socialSituation === 'VULNERABLE' ? 'Vulnerável' : 
            item.socialSituation === 'CRITICAL' ? 'Crítico' : 'Estável',
      value: item._count.id,
      key: item.socialSituation
    }));

    // 5.2 Atendimentos por Tipo
    const typeCounts = await prisma.appointment.groupBy({
      by: ['type'],
      _count: {
        id: true
      }
    });

    const appointmentTypeData = typeCounts.map(item => ({
      name: item.type,
      value: item._count.id
    }));

    // 6. Próximos Atendimentos e Visitas Agendadas (futuros ou hoje)
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: startOfToday
        }
      },
      include: {
        family: { select: { nameResponsible: true } },
        user: { select: { name: true } }
      },
      orderBy: { date: 'asc' },
      take: 3
    });

    const upcomingVisits = await prisma.visit.findMany({
      where: {
        date: {
          gte: startOfToday
        },
        status: 'SCHEDULED'
      },
      include: {
        family: { select: { nameResponsible: true, address: true } },
        user: { select: { name: true } }
      },
      orderBy: { date: 'asc' },
      take: 3
    });

    res.json({
      stats: {
        totalFamilies,
        appointmentsThisMonth,
        criticalCases,
        pendingReferrals
      },
      charts: {
        socialSituationData,
        appointmentTypeData
      },
      upcoming: {
        appointments: upcomingAppointments.map(app => ({
          id: app.id,
          family: app.family.nameResponsible,
          assistant: app.user.name,
          date: app.date,
          type: app.type
        })),
        visits: upcomingVisits.map(v => ({
          id: v.id,
          family: v.family.nameResponsible,
          address: v.family.address,
          assistant: v.user.name,
          date: v.date
        }))
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao carregar dados do dashboard' });
  }
};

module.exports = {
  getDashboardStats
};
