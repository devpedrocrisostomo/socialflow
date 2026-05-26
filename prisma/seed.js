const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seeding do banco de dados...');

  // Limpar tabelas para evitar duplicidade no seed
  await prisma.notification.deleteMany({});
  await prisma.report.deleteMany({});
  await prisma.referral.deleteMany({});
  await prisma.visit.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.person.deleteMany({});
  await prisma.family.deleteMany({});
  await prisma.user.deleteMany({});

  // Criptografar senha padrão
  const hashedPassword = await bcrypt.hash('123456', 10);

  // 1. Criar Usuários
  const admin = await prisma.user.create({
    data: {
      name: 'Admin SocialFlow',
      email: 'admin@socialflow.com.br',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  const assistente1 = await prisma.user.create({
    data: {
      name: 'Maria Silva',
      email: 'maria@socialflow.com.br',
      password: hashedPassword,
      role: 'SOCIAL_ASSISTANT',
    },
  });

  const assistente2 = await prisma.user.create({
    data: {
      name: 'João Pereira',
      email: 'joao@socialflow.com.br',
      password: hashedPassword,
      role: 'SOCIAL_ASSISTANT',
    },
  });

  console.log('Usuários criados com sucesso!');

  // 2. Criar Famílias e Membros
  // Família 1
  const familia1 = await prisma.family.create({
    data: {
      nameResponsible: 'Ana Silva dos Santos',
      cpf: '123.456.789-00',
      phone: '(11) 98888-7777',
      address: 'Rua das Flores, 123, Jardim Paulista, São Paulo - SP',
      familyIncome: 1200.00,
      memberCount: 4,
      socialSituation: 'VULNERABLE',
      notes: 'Família reside em imóvel alugado de alvenaria simples. Necessita de acompanhamento para inserção de programas de renda.',
      members: {
        create: [
          {
            name: 'Ana Silva dos Santos',
            age: 38,
            schooling: 'Ensino Médio Completo',
            employmentStatus: 'Desempregada (Bicos de costura)',
            documents: 'RG: 12.345.678-9, CPF: 123.456.789-00',
            specialNeeds: 'Nenhuma',
          },
          {
            name: 'Lucas Silva dos Santos',
            age: 15,
            schooling: 'Ensino Fundamental II (Incompleto)',
            employmentStatus: 'Estudante',
            documents: 'RG: 98.765.432-1',
            specialNeeds: 'Nenhuma',
          },
          {
            name: 'Julia Silva dos Santos',
            age: 8,
            schooling: 'Ensino Fundamental I (Incompleto)',
            employmentStatus: 'Estudante',
            documents: 'RG: Em emissão',
            specialNeeds: 'Nenhuma',
          },
          {
            name: 'Roberto Silva dos Santos',
            age: 42,
            schooling: 'Ensino Fundamental I (Incompleto)',
            employmentStatus: 'Autônomo (Ajudante de Pedreiro)',
            documents: 'RG: 11.222.333-4, CPF: 222.333.444-55',
            specialNeeds: 'Nenhuma',
          },
        ],
      },
    },
  });

  // Família 2
  const familia2 = await prisma.family.create({
    data: {
      nameResponsible: 'Mariana Oliveira Souza',
      cpf: '987.654.321-11',
      phone: '(11) 97777-6666',
      address: 'Av. Brasil, 456, Bloco B - Apto 12, Cohab, São Paulo - SP',
      familyIncome: 650.00,
      memberCount: 3,
      socialSituation: 'CRITICAL',
      notes: 'Família monoparental com grave vulnerabilidade social. A responsável possui deficiência física.',
      members: {
        create: [
          {
            name: 'Mariana Oliveira Souza',
            age: 28,
            schooling: 'Ensino Médio Incompleto',
            employmentStatus: 'Desempregada',
            documents: 'RG: 23.456.789-0, CPF: 987.654.321-11',
            specialNeeds: 'Deficiência física (Cadeirante - sequela de poliomielite)',
          },
          {
            name: 'Pedro Oliveira Souza',
            age: 6,
            schooling: 'Educação Infantil',
            employmentStatus: 'Estudante',
            documents: 'Certidão de Nascimento',
            specialNeeds: 'Nenhuma',
          },
          {
            name: 'Clarice Oliveira Souza',
            age: 50,
            schooling: 'Ensino Fundamental I (Incompleto)',
            employmentStatus: 'Aposentada por Invalidez',
            documents: 'RG: 34.567.890-1, CPF: 444.555.666-77',
            specialNeeds: 'Hipertensão e diabetes crônicos',
          },
        ],
      },
    },
  });

  // Família 3
  const familia3 = await prisma.family.create({
    data: {
      nameResponsible: 'Carlos Eduardo Lima',
      cpf: '456.789.123-22',
      phone: '(11) 96666-5555',
      address: 'Rua Bela Vista, 78, Bairro Alto, São Paulo - SP',
      familyIncome: 2500.00,
      memberCount: 2,
      socialSituation: 'STABLE',
      notes: 'Família em situação de estabilidade temporária. Acompanhamento focado em qualificação profissional.',
      members: {
        create: [
          {
            name: 'Carlos Eduardo Lima',
            age: 32,
            schooling: 'Ensino Médio Completo',
            employmentStatus: 'Empregado Formal (Auxiliar de Serviços Gerais)',
            documents: 'RG: 45.678.901-2, CPF: 456.789.123-22',
            specialNeeds: 'Nenhuma',
          },
          {
            name: 'Vitor Lima',
            age: 10,
            schooling: 'Ensino Fundamental I (Incompleto)',
            employmentStatus: 'Estudante',
            documents: 'RG: 56.789.012-3',
            specialNeeds: 'Transtorno do Espectro Autista (TEA) leve',
          },
        ],
      },
    },
  });

  console.log('Famílias e membros criados com sucesso!');

  // 3. Criar Atendimentos
  await prisma.appointment.create({
    data: {
      familyId: familia1.id,
      userId: assistente1.id,
      date: new Date('2026-05-10T14:30:00Z'),
      type: 'Presencial',
      description: 'Acolhimento inicial da família Silva. Realizada entrevista socioeconômica e triagem de demandas. Identificou-se que a família está com aluguel atrasado e dificuldades alimentares.',
      notes: 'Encaminhado pedido emergencial de cesta básica e agendada visita domiciliar para validação de habitação.',
    },
  });

  await prisma.appointment.create({
    data: {
      familyId: familia2.id,
      userId: assistente1.id,
      date: new Date('2026-05-20T10:00:00Z'),
      type: 'Emergencial',
      description: 'Atendimento emergencial de Mariana devido a corte de energia elétrica na residência e falta total de mantimentos.',
      notes: 'Liberado benefício eventual de cesta básica e iniciado encaminhamento para o CREAS por violação de acessibilidade.',
    },
  });

  await prisma.appointment.create({
    data: {
      familyId: familia3.id,
      userId: assistente2.id,
      date: new Date('2026-05-18T15:00:00Z'),
      type: 'Remoto',
      description: 'Orientação por telefone com Carlos sobre cursos de qualificação profissional disponíveis na prefeitura para promoção de autonomia financeira.',
      notes: 'Candidato demonstrou interesse em curso de Operador de Empilhadeira.',
    },
  });

  console.log('Atendimentos criados com sucesso!');

  // 4. Criar Visitas Domiciliares
  await prisma.visit.create({
    data: {
      familyId: familia1.id,
      userId: assistente1.id,
      date: new Date('2026-05-15T09:00:00Z'),
      status: 'COMPLETED',
      situationFound: 'Residência alugada de alvenaria sem revestimento interno, infiltrações visíveis nos quartos. Saneamento básico instalado, mas rede elétrica irregular (gato). A família demonstrou boa convivência familiar, mas preocupação extrema com a renda.',
      notes: 'Recomendada inserção no programa estadual de habitação e acompanhamento continuado.',
    },
  });

  await prisma.visit.create({
    data: {
      familyId: familia2.id,
      userId: assistente1.id,
      date: new Date('2026-05-22T11:00:00Z'),
      status: 'COMPLETED',
      situationFound: 'Residência adaptada de forma precária para cadeirante. Rampa de acesso com inclinação perigosa. Banheiro não possui barras de apoio. Alimentação deficitária.',
      notes: 'Visita prioritária. Necessidade de articulação urgente com a Secretaria de Obras e Saúde para adequação habitacional e fornecimento de insumos.',
    },
  });

  await prisma.visit.create({
    data: {
      familyId: familia1.id,
      userId: assistente1.id,
      date: new Date('2026-05-28T14:00:00Z'),
      status: 'SCHEDULED',
      notes: 'Visita de retorno agendada para verificar se as cestas básicas foram entregues e checar andamento do Cadastro Único.',
    },
  });

  console.log('Visitas domiciliares criadas com sucesso!');

  // 5. Criar Encaminhamentos
  await prisma.referral.create({
    data: {
      familyId: familia1.id,
      userId: assistente1.id,
      destination: 'CRAS - Centro de Referência de Assistência Social',
      status: 'PENDING',
      description: 'Encaminhamento da responsável Ana Silva para cadastramento no CadÚnico e inserção no programa Bolsa Família.',
      feedbackNotes: 'Aguardando comparecimento e retorno da equipe do CRAS.',
    },
  });

  await prisma.referral.create({
    data: {
      familyId: familia2.id,
      userId: assistente1.id,
      destination: 'Hospital Municipal (Fisioterapia)',
      status: 'ACTIVE',
      description: 'Encaminhamento médico-social de Mariana para consulta com ortopedista e início de sessões de fisioterapia motora para melhoria da mobilidade.',
      feedbackNotes: 'Encaminhamento enviado à central de regulação de vagas.',
    },
  });

  await prisma.referral.create({
    data: {
      familyId: familia2.id,
      userId: assistente2.id,
      destination: 'Escola Municipal de Educação Infantil (EMEI)',
      status: 'RESOLVED',
      description: 'Encaminhamento de matrícula prioritária para Pedro Oliveira Souza devido à situação de extrema vulnerabilidade familiar.',
      feedbackNotes: 'Matrícula confirmada no turno matutino. Menino já iniciou as aulas.',
    },
  });

  console.log('Encaminhamentos criados com sucesso!');

  // 6. Criar Relatórios Sociais
  await prisma.report.create({
    data: {
      familyId: familia1.id,
      userId: assistente1.id,
      title: 'Relatório de Estudo de Caso - Família Silva Santos',
      type: 'SOCIAL_REPORT',
      content: 'O presente relatório social visa apresentar a situação socioeconômica da família Silva Santos. Constatou-se situação de vulnerabilidade decorrente da falta de emprego formal da responsável e do companheiro. A renda mensal per capita é inferior a 1/4 do salário mínimo. Recomenda-se a concessão imediata de cesta básica como benefício eventual e inserção continuada no PAIF (Serviço de Proteção e Atendimento Integral à Família).',
    },
  });

  await prisma.report.create({
    data: {
      familyId: familia2.id,
      userId: assistente1.id,
      title: 'Parecer Técnico Social - Habitação e Acessibilidade Mariana',
      type: 'FAMILY_REPORT',
      content: 'Avaliação técnica sobre as barreiras arquitetônicas enfrentadas por Mariana, cadeirante. A habitação atual oferece riscos de queda e limita severamente a autonomia da assistida. Propõe-se intervenção intersetorial junto à pasta de Habitação e Saúde do Município para adequação do imóvel e fornecimento de cadeira de rodas motorizada pelo SUS.',
    },
  });

  console.log('Relatórios sociais criados com sucesso!');

  // 7. Criar Notificações
  await prisma.notification.create({
    data: {
      userId: assistente1.id,
      title: 'Visita Próxima',
      message: 'Você tem uma visita agendada com a família Ana Silva dos Santos para o dia 28/05/2026.',
      type: 'VISIT',
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: assistente1.id,
      title: 'Encaminhamento Pendente',
      message: 'O encaminhamento de Bolsa Família para a família Silva Santos no CRAS está pendente há mais de 10 dias.',
      type: 'REFERRAL',
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: assistente2.id,
      title: 'Matrícula Resolvida',
      message: 'O encaminhamento de matrícula escolar de Pedro Oliveira Souza foi resolvido.',
      type: 'REFERRAL',
      isRead: true,
    },
  });

  console.log('Notificações criadas com sucesso!');
  console.log('Seeding do banco concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
