const prisma = require('../config/prisma');

const addPerson = async (req, res) => {
  const { familyId, name, age, schooling, employmentStatus, documents, specialNeeds } = req.body;

  if (!familyId || !name || age === undefined || !schooling || !employmentStatus || !documents || !specialNeeds) {
    return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos' });
  }

  try {
    const family = await prisma.family.findUnique({
      where: { id: parseInt(familyId) }
    });

    if (!family) {
      return res.status(404).json({ error: 'Família não encontrada' });
    }

    const person = await prisma.person.create({
      data: {
        familyId: parseInt(familyId),
        name,
        age: parseInt(age),
        schooling,
        employmentStatus,
        documents,
        specialNeeds,
      },
    });

    // Atualiza automaticamente o contador de membros da família
    const membersCount = await prisma.person.count({
      where: { familyId: parseInt(familyId) }
    });

    await prisma.family.update({
      where: { id: parseInt(familyId) },
      data: { memberCount: membersCount }
    });

    res.status(201).json(person);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao cadastrar integrante' });
  }
};

const updatePerson = async (req, res) => {
  const { id } = req.params;
  const { name, age, schooling, employmentStatus, documents, specialNeeds } = req.body;

  try {
    const person = await prisma.person.findUnique({
      where: { id: parseInt(id) }
    });

    if (!person) {
      return res.status(404).json({ error: 'Integrante não encontrado' });
    }

    const updated = await prisma.person.update({
      where: { id: parseInt(id) },
      data: {
        name,
        age: age !== undefined ? parseInt(age) : undefined,
        schooling,
        employmentStatus,
        documents,
        specialNeeds,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar dados do integrante' });
  }
};

const deletePerson = async (req, res) => {
  const { id } = req.params;

  try {
    const person = await prisma.person.findUnique({
      where: { id: parseInt(id) }
    });

    if (!person) {
      return res.status(404).json({ error: 'Integrante não encontrado' });
    }

    await prisma.person.delete({
      where: { id: parseInt(id) }
    });

    // Atualiza automaticamente o contador de membros da família
    const membersCount = await prisma.person.count({
      where: { familyId: person.familyId }
    });

    await prisma.family.update({
      where: { id: person.familyId },
      data: { memberCount: membersCount }
    });

    res.json({ message: 'Integrante excluído com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao excluir integrante' });
  }
};

module.exports = {
  addPerson,
  updatePerson,
  deletePerson,
};
