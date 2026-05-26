const prisma = require('../config/prisma');

const globalSearch = async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.json({ families: [], people: [], appointments: [], reports: [] });
  }

  try {
    const query = q.trim();

    // 1. Busca em Famílias (nome do responsável, CPF, endereço, observações)
    const families = await prisma.family.findMany({
      where: {
        OR: [
          { nameResponsible: { contains: query, mode: 'insensitive' } },
          { cpf: { contains: query, mode: 'insensitive' } },
          { address: { contains: query, mode: 'insensitive' } },
          { notes: { contains: query, mode: 'insensitive' } },
        ]
      },
      take: 5
    });

    // 2. Busca em Pessoas (nome, escolaridade, emprego, necessidades especiais, documentos)
    const people = await prisma.person.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { schooling: { contains: query, mode: 'insensitive' } },
          { employmentStatus: { contains: query, mode: 'insensitive' } },
          { documents: { contains: query, mode: 'insensitive' } },
          { specialNeeds: { contains: query, mode: 'insensitive' } },
        ]
      },
      include: {
        family: { select: { id: true, nameResponsible: true } }
      },
      take: 5
    });

    // 3. Busca em Atendimentos (tipo, descrição, observações/anotações)
    const appointments = await prisma.appointment.findMany({
      where: {
        OR: [
          { type: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { notes: { contains: query, mode: 'insensitive' } },
        ]
      },
      include: {
        family: { select: { id: true, nameResponsible: true } }
      },
      take: 5
    });

    // 4. Busca em Relatórios (título, conteúdo)
    const reports = await prisma.report.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
        ]
      },
      include: {
        family: { select: { id: true, nameResponsible: true } }
      },
      take: 5
    });

    res.json({
      families,
      people,
      appointments,
      reports
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro na busca global' });
  }
};

module.exports = {
  globalSearch
};
