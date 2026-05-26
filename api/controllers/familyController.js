const prisma = require('../config/prisma');

const createFamily = async (req, res) => {
  const { nameResponsible, cpf, phone, address, familyIncome, memberCount, socialSituation, notes } = req.body;

  if (!nameResponsible || !cpf || !phone || !address || familyIncome === undefined || !memberCount || !socialSituation) {
    return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos' });
  }

  try {
    const existingFamily = await prisma.family.findUnique({ where: { cpf } });
    if (existingFamily) {
      return res.status(400).json({ error: 'Já existe uma família cadastrada com este CPF' });
    }

    const family = await prisma.family.create({
      data: {
        nameResponsible,
        cpf,
        phone,
        address,
        familyIncome: parseFloat(familyIncome),
        memberCount: parseInt(memberCount),
        socialSituation,
        notes,
      },
    });

    res.status(201).json(family);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao cadastrar família' });
  }
};

const getFamilies = async (req, res) => {
  const { search, socialSituation, minIncome, maxIncome } = req.query;

  const where = {};

  if (search) {
    where.OR = [
      { nameResponsible: { contains: search, mode: 'insensitive' } },
      { cpf: { contains: search, mode: 'insensitive' } },
      { address: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (socialSituation) {
    where.socialSituation = socialSituation;
  }

  if (minIncome || maxIncome) {
    where.familyIncome = {};
    if (minIncome) where.familyIncome.gte = parseFloat(minIncome);
    if (maxIncome) where.familyIncome.lte = parseFloat(maxIncome);
  }

  try {
    const families = await prisma.family.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        members: {
          select: { id: true, name: true }
        }
      }
    });

    res.json(families);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar famílias' });
  }
};

const getFamilyById = async (req, res) => {
  const { id } = req.params;

  try {
    const family = await prisma.family.findUnique({
      where: { id: parseInt(id) },
      include: {
        members: {
          orderBy: { age: 'desc' }
        },
        appointments: {
          include: {
            user: { select: { id: true, name: true } }
          },
          orderBy: { date: 'desc' }
        },
        visits: {
          include: {
            user: { select: { id: true, name: true } }
          },
          orderBy: { date: 'desc' }
        },
        referrals: {
          include: {
            user: { select: { id: true, name: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        reports: {
          include: {
            user: { select: { id: true, name: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!family) {
      return res.status(404).json({ error: 'Família não encontrada' });
    }

    res.json(family);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar detalhes da família' });
  }
};

const updateFamily = async (req, res) => {
  const { id } = req.params;
  const { nameResponsible, cpf, phone, address, familyIncome, memberCount, socialSituation, notes } = req.body;

  try {
    if (cpf) {
      const existingFamily = await prisma.family.findFirst({
        where: { cpf, NOT: { id: parseInt(id) } }
      });
      if (existingFamily) {
        return res.status(400).json({ error: 'Já existe outra família cadastrada com este CPF' });
      }
    }

    const updated = await prisma.family.update({
      where: { id: parseInt(id) },
      data: {
        nameResponsible,
        cpf,
        phone,
        address,
        familyIncome: familyIncome !== undefined ? parseFloat(familyIncome) : undefined,
        memberCount: memberCount !== undefined ? parseInt(memberCount) : undefined,
        socialSituation,
        notes,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar dados da família' });
  }
};

const deleteFamily = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.family.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: 'Família excluída com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao excluir família' });
  }
};

module.exports = {
  createFamily,
  getFamilies,
  getFamilyById,
  updateFamily,
  deleteFamily,
};
