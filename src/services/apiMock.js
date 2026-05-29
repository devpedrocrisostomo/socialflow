// Mock API Service for Demo Mode (SocialFlow)
// Simulates a full backend database in the browser using localStorage.

const getDB = (key, defaultValue) => {
  const data = localStorage.getItem(`sf_${key}`);
  if (!data) {
    localStorage.setItem(`sf_${key}`, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error(`Error parsing localStorage key sf_${key}`, e);
    return defaultValue;
  }
};

const saveDB = (key, data) => {
  localStorage.setItem(`sf_${key}`, JSON.stringify(data));
};

// Initial Seed Data (matching prisma/seed.js)
const INITIAL_USERS = [
  { id: 'u1', name: 'Admin SocialFlow', email: 'admin@socialflow.com.br', role: 'ADMIN', password: '123456' },
  { id: 'u2', name: 'Maria Silva', email: 'maria@socialflow.com.br', role: 'SOCIAL_ASSISTANT', password: '123456' },
  { id: 'u3', name: 'João Pereira', email: 'joao@socialflow.com.br', role: 'SOCIAL_ASSISTANT', password: '123456' }
];

const INITIAL_FAMILIES = [
  {
    id: 'f1',
    nameResponsible: 'Ana Silva dos Santos',
    cpf: '123.456.789-00',
    phone: '(11) 98888-7777',
    address: 'Rua das Flores, 123, Jardim Paulista, São Paulo - SP',
    familyIncome: 1200.00,
    memberCount: 4,
    socialSituation: 'VULNERABLE',
    notes: 'Família reside em imóvel alugado de alvenaria simples. Necessita de acompanhamento para inserção de programas de renda.',
    createdAt: new Date('2026-05-01T10:00:00Z').toISOString()
  },
  {
    id: 'f2',
    nameResponsible: 'Mariana Oliveira Souza',
    cpf: '987.654.321-11',
    phone: '(11) 97777-6666',
    address: 'Av. Brasil, 456, Bloco B - Apto 12, Cohab, São Paulo - SP',
    familyIncome: 650.00,
    memberCount: 3,
    socialSituation: 'CRITICAL',
    notes: 'Família monoparental com grave vulnerabilidade social. A responsável possui deficiência física.',
    createdAt: new Date('2026-05-02T10:00:00Z').toISOString()
  },
  {
    id: 'f3',
    nameResponsible: 'Carlos Eduardo Lima',
    cpf: '456.789.123-22',
    phone: '(11) 96666-5555',
    address: 'Rua Bela Vista, 78, Bairro Alto, São Paulo - SP',
    familyIncome: 2500.00,
    memberCount: 2,
    socialSituation: 'STABLE',
    notes: 'Família em situação de estabilidade temporária. Acompanhamento focado em qualificação profissional.',
    createdAt: new Date('2026-05-03T10:00:00Z').toISOString()
  }
];

const INITIAL_PEOPLE = [
  // Família 1
  { id: 'p1', familyId: 'f1', name: 'Ana Silva dos Santos', age: 38, schooling: 'Ensino Médio Completo', employmentStatus: 'Desempregada (Bicos de costura)', documents: 'RG: 12.345.678-9, CPF: 123.456.789-00', specialNeeds: 'Nenhuma' },
  { id: 'p2', familyId: 'f1', name: 'Lucas Silva dos Santos', age: 15, schooling: 'Ensino Fundamental II (Incompleto)', employmentStatus: 'Estudante', documents: 'RG: 98.765.432-1', specialNeeds: 'Nenhuma' },
  { id: 'p3', familyId: 'f1', name: 'Julia Silva dos Santos', age: 8, schooling: 'Ensino Fundamental I (Incompleto)', employmentStatus: 'Estudante', documents: 'RG: Em emissão', specialNeeds: 'Nenhuma' },
  { id: 'p4', familyId: 'f1', name: 'Roberto Silva dos Santos', age: 42, schooling: 'Ensino Fundamental I (Incompleto)', employmentStatus: 'Autônomo (Ajudante de Pedreiro)', documents: 'RG: 11.222.333-4, CPF: 222.333.444-55', specialNeeds: 'Nenhuma' },
  // Família 2
  { id: 'p5', familyId: 'f2', name: 'Mariana Oliveira Souza', age: 28, schooling: 'Ensino Médio Incompleto', employmentStatus: 'Desempregada', documents: 'RG: 23.456.789-0, CPF: 987.654.321-11', specialNeeds: 'Deficiência física (Cadeirante - sequela de poliomielite)' },
  { id: 'p6', familyId: 'f2', name: 'Pedro Oliveira Souza', age: 6, schooling: 'Educação Infantil', employmentStatus: 'Estudante', documents: 'Certidão de Nascimento', specialNeeds: 'Nenhuma' },
  { id: 'p7', familyId: 'f2', name: 'Clarice Oliveira Souza', age: 50, schooling: 'Ensino Fundamental I (Incompleto)', employmentStatus: 'Aposentada por Invalidez', documents: 'RG: 34.567.890-1, CPF: 444.555.666-77', specialNeeds: 'Hipertensão e diabetes crônicos' },
  // Família 3
  { id: 'p8', familyId: 'f3', name: 'Carlos Eduardo Lima', age: 32, schooling: 'Ensino Médio Completo', employmentStatus: 'Empregado Formal (Auxiliar de Serviços Gerais)', documents: 'RG: 45.678.901-2, CPF: 456.789.123-22', specialNeeds: 'Nenhuma' },
  { id: 'p9', familyId: 'f3', name: 'Vitor Lima', age: 10, schooling: 'Ensino Fundamental I (Incompleto)', employmentStatus: 'Estudante', documents: 'RG: 56.789.012-3', specialNeeds: 'Transtorno do Espectro Autista (TEA) leve' }
];

const INITIAL_APPOINTMENTS = [
  { id: 'a1', familyId: 'f1', userId: 'u2', date: new Date('2026-05-10T14:30:00Z').toISOString(), type: 'Presencial', description: 'Acolhimento inicial da família Silva. Realizada entrevista socioeconômica e triagem de demandas. Identificou-se que a família está com aluguel atrasado e dificuldades alimentares.', notes: 'Encaminhado pedido emergencial de cesta básica e agendada visita domiciliar para validação de habitação.' },
  { id: 'a2', familyId: 'f2', userId: 'u2', date: new Date('2026-05-20T10:00:00Z').toISOString(), type: 'Emergencial', description: 'Atendimento emergencial de Mariana devido a corte de energia elétrica na residência e falta total de mantimentos.', notes: 'Liberado benefício eventual de cesta básica e iniciado encaminhamento para o CREAS por violação de acessibilidade.' },
  { id: 'a3', familyId: 'f3', userId: 'u3', date: new Date('2026-05-18T15:00:00Z').toISOString(), type: 'Remoto', description: 'Orientação por telefone com Carlos sobre cursos de qualificação profissional disponíveis na prefeitura para promoção de autonomia financeira.', notes: 'Candidato demonstrou interesse em curso de Operador de Empilhadeira.' }
];

const INITIAL_VISITS = [
  { id: 'v1', familyId: 'f1', userId: 'u2', date: new Date('2026-05-15T09:00:00Z').toISOString(), status: 'COMPLETED', situationFound: 'Residência alugada de alvenaria sem revestimento interno, infiltrações visíveis nos quartos. Saneamento básico instalado, mas rede elétrica irregular (gato). A família demonstrou boa convivência familiar, mas preocupação extrema com a renda.', notes: 'Recomendada inserção no programa estadual de habitação e acompanhamento continuado.' },
  { id: 'v2', familyId: 'f2', userId: 'u2', date: new Date('2026-05-22T11:00:00Z').toISOString(), status: 'COMPLETED', situationFound: 'Residência adaptada de forma precária para cadeirante. Rampa de acesso com inclinação perigosa. Banheiro não possui barras de apoio. Alimentação deficitária.', notes: 'Visita prioritária. Necessidade de articulação urgente com a Secretaria de Obras e Saúde para adequação habitacional e fornecimento de insumos.' },
  { id: 'v3', familyId: 'f1', userId: 'u2', date: new Date('2026-06-28T14:00:00Z').toISOString(), status: 'SCHEDULED', situationFound: '', notes: 'Visita de retorno agendada para verificar se as cestas básicas foram entregues e checar andamento do Cadastro Único.' }
];

const INITIAL_REFERRALS = [
  { id: 'r1', familyId: 'f1', userId: 'u2', destination: 'CRAS - Centro de Referência de Assistência Social', status: 'PENDING', description: 'Encaminhamento da responsável Ana Silva para cadastramento no CadÚnico e inserção no programa Bolsa Família.', feedbackNotes: 'Aguardando comparecimento e retorno da equipe do CRAS.', createdAt: new Date('2026-05-10T11:00:00Z').toISOString() },
  { id: 'r2', familyId: 'f2', userId: 'u2', destination: 'Hospital Municipal (Fisioterapia)', status: 'ACTIVE', description: 'Encaminhamento médico-social de Mariana para consulta com ortopedista e início de sessões de fisioterapia motora para melhoria da mobilidade.', feedbackNotes: 'Encaminhamento enviado à central de regulação de vagas.', createdAt: new Date('2026-05-20T12:00:00Z').toISOString() },
  { id: 'r3', familyId: 'f2', userId: 'u3', destination: 'Escola Municipal de Educação Infantil (EMEI)', status: 'RESOLVED', description: 'Encaminhamento de matrícula prioritária para Pedro Oliveira Souza devido à situação de extrema vulnerabilidade familiar.', feedbackNotes: 'Matrícula confirmada no turno matutino. Menino já iniciou as aulas.', createdAt: new Date('2026-05-18T10:00:00Z').toISOString() }
];

const INITIAL_REPORTS = [
  { id: 'rep1', familyId: 'f1', userId: 'u2', title: 'Relatório de Estudo de Caso - Família Silva Santos', type: 'SOCIAL_REPORT', content: 'O presente relatório social visa apresentar a situação socioeconômica da família Silva Santos. Constatou-se situação de vulnerabilidade decorrente da falta de emprego formal da responsável e do companheiro. A renda mensal per capita é inferior a 1/4 do salário mínimo. Recomenda-se a concessão imediata de cesta básica como benefício eventual e inserção continuada no PAIF (Serviço de Proteção e Atendimento Integral à Família).', createdAt: new Date('2026-05-15T16:00:00Z').toISOString() },
  { id: 'rep2', familyId: 'f2', userId: 'u2', title: 'Parecer Técnico Social - Habitação e Acessibilidade Mariana', type: 'FAMILY_REPORT', content: 'Avaliação técnica sobre as barreiras arquitetônicas enfrentadas por Mariana, cadeirante. A habitação atual oferece riscos de queda e limita severamente a autonomia da assistida. Propõe-se intervenção intersetorial junto à pasta de Habitação e Saúde do Município para adequação do imóvel e fornecimento de cadeira de rodas motorizada pelo SUS.', createdAt: new Date('2026-05-22T17:00:00Z').toISOString() }
];

const INITIAL_NOTIFICATIONS = [
  { id: 'n1', userId: 'u2', title: 'Visita Próxima', message: 'Você tem uma visita agendada com a família Ana Silva dos Santos para o dia 28/06/2026.', type: 'VISIT', isRead: false, createdAt: new Date().toISOString() },
  { id: 'n2', userId: 'u2', title: 'Encaminhamento Pendente', message: 'O encaminhamento de Bolsa Família para a família Silva Santos no CRAS está pendente há mais de 10 dias.', type: 'REFERRAL', isRead: false, createdAt: new Date().toISOString() },
  { id: 'n3', userId: 'u3', title: 'Matrícula Resolvida', message: 'O encaminhamento de matrícula escolar de Pedro Oliveira Souza foi resolvido.', type: 'REFERRAL', isRead: true, createdAt: new Date().toISOString() }
];

// Helper to simulate network latency
const delay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

// Parse query params and URL matching
const parseUrl = (url) => {
  const cleanUrl = url.replace(/^\/api/, '');
  const [path, queryString] = cleanUrl.split('?');
  const query = queryString ? Object.fromEntries(new URLSearchParams(queryString).entries()) : {};
  return { path, query };
};

// Route definitions & mock handlers
const handlers = {
  // --- AUTH ENTITIES ---
  'POST /auth/login': async (data) => {
    const users = getDB('users', INITIAL_USERS);
    const { email, password } = data;
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      throw { status: 401, error: 'E-mail ou senha incorretos!' };
    }
    // Return mock JWT and user metadata
    return {
      token: `mock-jwt-${user.id}-${Date.now()}`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  },

  'PUT /auth/profile': async (data) => {
    const currentUser = JSON.parse(localStorage.getItem('socialflow_user') || '{}');
    if (!currentUser.id) throw { status: 401, error: 'Não autorizado' };

    const users = getDB('users', INITIAL_USERS);
    const index = users.findIndex(u => u.id === currentUser.id);
    if (index === -1) throw { status: 404, error: 'Usuário não encontrado' };

    const updatedUser = { ...users[index], ...data };
    if (data.password) {
      updatedUser.password = data.password;
    }
    users[index] = updatedUser;
    saveDB('users', users);

    return {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role
    };
  },

  'GET /auth/users': async () => {
    const users = getDB('users', INITIAL_USERS);
    return users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role }));
  },

  'POST /auth/register': async (data) => {
    const users = getDB('users', INITIAL_USERS);
    if (users.some(u => u.email === data.email)) {
      throw { status: 400, error: 'E-mail já cadastrado!' };
    }
    const newUser = {
      id: 'u_' + Math.random().toString(36).substr(2, 9),
      name: data.name,
      email: data.email,
      role: data.role,
      password: data.password || '123456'
    };
    users.push(newUser);
    saveDB('users', users);
    return { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role };
  },

  // --- DASHBOARD ---
  'GET /dashboard': async () => {
    const families = getDB('families', INITIAL_FAMILIES);
    const appointments = getDB('appointments', INITIAL_APPOINTMENTS);
    const visits = getDB('visits', INITIAL_VISITS);
    const referrals = getDB('referrals', INITIAL_REFERRALS);
    const users = getDB('users', INITIAL_USERS);

    // Stats
    const totalFamilies = families.length;
    
    // Filter appointments this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const appointmentsThisMonth = appointments.filter(a => new Date(a.date) >= startOfMonth).length;

    // Critical cases
    const criticalCases = families.filter(f => f.socialSituation === 'CRITICAL').length;

    // Pending referrals
    const pendingReferrals = referrals.filter(r => r.status === 'PENDING').length;

    // Charts: Social Situation
    const socialSituationData = [
      { name: 'Estável', value: families.filter(f => f.socialSituation === 'STABLE').length, key: 'STABLE' },
      { name: 'Vulnerável', value: families.filter(f => f.socialSituation === 'VULNERABLE').length, key: 'VULNERABLE' },
      { name: 'Crítico', value: families.filter(f => f.socialSituation === 'CRITICAL').length, key: 'CRITICAL' }
    ];

    // Charts: Appointment Type
    const typeCounts = appointments.reduce((acc, app) => {
      acc[app.type] = (acc[app.type] || 0) + 1;
      return acc;
    }, {});
    const appointmentTypeData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));

    // Upcoming appointments
    const upcomingAppointments = appointments
      .filter(a => new Date(a.date) >= now)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 3)
      .map(a => {
        const family = families.find(f => f.id === a.familyId);
        const user = users.find(u => u.id === a.userId);
        return {
          id: a.id,
          family: family ? family.nameResponsible : 'Desconhecida',
          assistant: user ? user.name : 'Desconhecido',
          date: a.date,
          type: a.type
        };
      });

    // Upcoming visits
    const upcomingVisits = visits
      .filter(v => v.status === 'SCHEDULED')
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 3)
      .map(v => {
        const family = families.find(f => f.id === v.familyId);
        const user = users.find(u => u.id === v.userId);
        return {
          id: v.id,
          family: family ? family.nameResponsible : 'Desconhecida',
          address: family ? family.address : 'Sem endereço',
          date: v.date,
          assistant: user ? user.name : 'Desconhecido'
        };
      });

    return {
      stats: { totalFamilies, appointmentsThisMonth, criticalCases, pendingReferrals },
      charts: { socialSituationData, appointmentTypeData },
      upcoming: { appointments: upcomingAppointments, visits: upcomingVisits }
    };
  },

  // --- FAMILIES ---
  'GET /families': async (data, query) => {
    let families = getDB('families', INITIAL_FAMILIES);

    // Apply filtering
    if (query.socialSituation) {
      families = families.filter(f => f.socialSituation === query.socialSituation);
    }
    if (query.search || query.q) {
      const q = (query.search || query.q).toLowerCase();
      families = families.filter(f => 
        f.nameResponsible.toLowerCase().includes(q) || 
        f.cpf.includes(q) ||
        f.address.toLowerCase().includes(q)
      );
    }
    return families;
  },

  'POST /families': async (data) => {
    const families = getDB('families', INITIAL_FAMILIES);
    const newFamily = {
      id: 'f_' + Math.random().toString(36).substr(2, 9),
      nameResponsible: data.nameResponsible,
      cpf: data.cpf,
      phone: data.phone,
      address: data.address,
      familyIncome: Number(data.familyIncome) || 0,
      memberCount: Number(data.memberCount) || 1,
      socialSituation: data.socialSituation || 'VULNERABLE',
      notes: data.notes || '',
      createdAt: new Date().toISOString()
    };
    families.push(newFamily);
    saveDB('families', families);
    return newFamily;
  },

  // --- VISITS ---
  'GET /visits': async (data, query) => {
    const visits = getDB('visits', INITIAL_VISITS);
    const families = getDB('families', INITIAL_FAMILIES);
    const users = getDB('users', INITIAL_USERS);

    let result = visits.map(v => {
      const family = families.find(f => f.id === v.familyId);
      const user = users.find(u => u.id === v.userId);
      return {
        ...v,
        family: family || null,
        user: user ? { id: user.id, name: user.name, role: user.role } : null
      };
    });

    if (query.status) {
      result = result.filter(v => v.status === query.status);
    }
    if (query.search || query.q) {
      const q = (query.search || query.q).toLowerCase();
      result = result.filter(v => 
        (v.family && v.family.nameResponsible.toLowerCase().includes(q)) ||
        (v.situationFound && v.situationFound.toLowerCase().includes(q))
      );
    }
    return result;
  },

  'POST /visits': async (data) => {
    const visits = getDB('visits', INITIAL_VISITS);
    const currentUser = JSON.parse(localStorage.getItem('socialflow_user') || '{}');
    const newVisit = {
      id: 'v_' + Math.random().toString(36).substr(2, 9),
      familyId: data.familyId,
      userId: currentUser.id || 'u2',
      date: new Date(data.date).toISOString(),
      status: data.status || 'SCHEDULED',
      situationFound: data.situationFound || '',
      notes: data.notes || ''
    };
    visits.push(newVisit);
    saveDB('visits', visits);
    return newVisit;
  },

  // --- APPOINTMENTS ---
  'GET /appointments': async (data, query) => {
    const appointments = getDB('appointments', INITIAL_APPOINTMENTS);
    const families = getDB('families', INITIAL_FAMILIES);
    const users = getDB('users', INITIAL_USERS);

    let result = appointments.map(a => {
      const family = families.find(f => f.id === a.familyId);
      const user = users.find(u => u.id === a.userId);
      return {
        ...a,
        family: family || null,
        user: user ? { id: user.id, name: user.name, role: user.role } : null
      };
    });

    if (query.search || query.q) {
      const q = (query.search || query.q).toLowerCase();
      result = result.filter(a => 
        (a.family && a.family.nameResponsible.toLowerCase().includes(q)) ||
        (a.description && a.description.toLowerCase().includes(q))
      );
    }
    return result;
  },

  'POST /appointments': async (data) => {
    const appointments = getDB('appointments', INITIAL_APPOINTMENTS);
    const currentUser = JSON.parse(localStorage.getItem('socialflow_user') || '{}');
    const newApp = {
      id: 'a_' + Math.random().toString(36).substr(2, 9),
      familyId: data.familyId,
      userId: currentUser.id || 'u2',
      date: new Date(data.date).toISOString(),
      type: data.type || 'Presencial',
      description: data.description || '',
      notes: data.notes || ''
    };
    appointments.push(newApp);
    saveDB('appointments', appointments);
    return newApp;
  },

  // --- REFERRALS ---
  'GET /referrals': async (data, query) => {
    const referrals = getDB('referrals', INITIAL_REFERRALS);
    const families = getDB('families', INITIAL_FAMILIES);
    const users = getDB('users', INITIAL_USERS);

    let result = referrals.map(r => {
      const family = families.find(f => f.id === r.familyId);
      const user = users.find(u => u.id === r.userId);
      return {
        ...r,
        family: family || null,
        user: user ? { id: user.id, name: user.name, role: user.role } : null
      };
    });

    if (query.status) {
      result = result.filter(r => r.status === query.status);
    }
    if (query.search || query.q) {
      const q = (query.search || query.q).toLowerCase();
      result = result.filter(r => 
        (r.family && r.family.nameResponsible.toLowerCase().includes(q)) ||
        (r.destination && r.destination.toLowerCase().includes(q)) ||
        (r.description && r.description.toLowerCase().includes(q))
      );
    }
    return result;
  },

  'POST /referrals': async (data) => {
    const referrals = getDB('referrals', INITIAL_REFERRALS);
    const currentUser = JSON.parse(localStorage.getItem('socialflow_user') || '{}');
    const newReferral = {
      id: 'r_' + Math.random().toString(36).substr(2, 9),
      familyId: data.familyId,
      userId: currentUser.id || 'u2',
      destination: data.destination,
      status: data.status || 'PENDING',
      description: data.description || '',
      feedbackNotes: data.feedbackNotes || '',
      createdAt: new Date().toISOString()
    };
    referrals.push(newReferral);
    saveDB('referrals', referrals);
    return newReferral;
  },

  // --- REPORTS ---
  'GET /reports': async (data, query) => {
    const reports = getDB('reports', INITIAL_REPORTS);
    const families = getDB('families', INITIAL_FAMILIES);
    const users = getDB('users', INITIAL_USERS);

    let result = reports.map(r => {
      const family = families.find(f => f.id === r.familyId);
      const user = users.find(u => u.id === r.userId);
      return {
        ...r,
        family: family || null,
        user: user ? { id: user.id, name: user.name, role: user.role } : null
      };
    });

    if (query.type) {
      result = result.filter(r => r.type === query.type);
    }
    if (query.search || query.q) {
      const q = (query.search || query.q).toLowerCase();
      result = result.filter(r => 
        (r.family && r.family.nameResponsible.toLowerCase().includes(q)) ||
        (r.title && r.title.toLowerCase().includes(q))
      );
    }
    return result;
  },

  'POST /reports': async (data) => {
    const reports = getDB('reports', INITIAL_REPORTS);
    const currentUser = JSON.parse(localStorage.getItem('socialflow_user') || '{}');
    const newReport = {
      id: 'rep_' + Math.random().toString(36).substr(2, 9),
      familyId: data.familyId,
      userId: currentUser.id || 'u2',
      title: data.title,
      type: data.type || 'SOCIAL_REPORT',
      content: data.content || '',
      createdAt: new Date().toISOString()
    };
    reports.push(newReport);
    saveDB('reports', reports);
    return newReport;
  },

  // --- PEOPLE ---
  'POST /people': async (data) => {
    const people = getDB('people', INITIAL_PEOPLE);
    const newPerson = {
      id: 'p_' + Math.random().toString(36).substr(2, 9),
      familyId: data.familyId,
      name: data.name,
      age: Number(data.age) || 0,
      schooling: data.schooling || '',
      employmentStatus: data.employmentStatus || '',
      documents: data.documents || '',
      specialNeeds: data.specialNeeds || ''
    };
    people.push(newPerson);
    saveDB('people', people);

    // Update family memberCount
    const families = getDB('families', INITIAL_FAMILIES);
    const fIdx = families.findIndex(f => f.id === data.familyId);
    if (fIdx !== -1) {
      families[fIdx].memberCount = people.filter(p => p.familyId === data.familyId).length;
      saveDB('families', families);
    }

    return newPerson;
  },

  // --- NOTIFICATIONS ---
  'GET /notifications': async () => {
    const notifications = getDB('notifications', INITIAL_NOTIFICATIONS);
    const currentUser = JSON.parse(localStorage.getItem('socialflow_user') || '{}');
    return notifications.filter(n => n.userId === (currentUser.id || 'u2'));
  },

  'PUT /notifications/read-all': async () => {
    const notifications = getDB('notifications', INITIAL_NOTIFICATIONS);
    const currentUser = JSON.parse(localStorage.getItem('socialflow_user') || '{}');
    const uId = currentUser.id || 'u2';

    notifications.forEach(n => {
      if (n.userId === uId) n.isRead = true;
    });
    saveDB('notifications', notifications);
    return { success: true };
  },

  // --- SEARCH ---
  'GET /search': async (data, query) => {
    const q = (query.q || '').toLowerCase();
    if (!q) return { families: [], appointments: [], visits: [] };

    const families = getDB('families', INITIAL_FAMILIES).filter(f => f.nameResponsible.toLowerCase().includes(q) || f.cpf.includes(q));
    const appointments = getDB('appointments', INITIAL_APPOINTMENTS).filter(a => a.description.toLowerCase().includes(q));
    const visits = getDB('visits', INITIAL_VISITS).filter(v => v.situationFound.toLowerCase().includes(q));

    return { families, appointments, visits };
  }
};

// Dynamic handler router
const getHandler = (method, path) => {
  // Exact match
  if (handlers[`${method} ${path}`]) {
    return handlers[`${method} ${path}`];
  }

  // Parameterized routes (e.g. GET /families/:id, PUT /families/:id, DELETE /families/:id)
  const familiesIdMatch = path.match(/^\/families\/([a-zA-Z0-9_-]+)$/);
  if (familiesIdMatch) {
    const id = familiesIdMatch[1];
    if (method === 'GET') {
      return async () => {
        const families = getDB('families', INITIAL_FAMILIES);
        const family = families.find(f => f.id === id);
        if (!family) throw { status: 404, error: 'Família não encontrada' };
        
        const people = getDB('people', INITIAL_PEOPLE);
        const members = people.filter(p => p.familyId === id);
        return { ...family, members };
      };
    }
    if (method === 'PUT') {
      return async (data) => {
        const families = getDB('families', INITIAL_FAMILIES);
        const idx = families.findIndex(f => f.id === id);
        if (idx === -1) throw { status: 404, error: 'Família não encontrada' };
        
        families[idx] = { ...families[idx], ...data };
        saveDB('families', families);
        return families[idx];
      };
    }
    if (method === 'DELETE') {
      return async () => {
        let families = getDB('families', INITIAL_FAMILIES);
        families = families.filter(f => f.id !== id);
        saveDB('families', families);

        let people = getDB('people', INITIAL_PEOPLE);
        people = people.filter(p => p.familyId !== id);
        saveDB('people', people);
        return { success: true };
      };
    }
  }

  const visitsIdMatch = path.match(/^\/visits\/([a-zA-Z0-9_-]+)$/);
  if (visitsIdMatch) {
    const id = visitsIdMatch[1];
    if (method === 'PUT') {
      return async (data) => {
        const visits = getDB('visits', INITIAL_VISITS);
        const idx = visits.findIndex(v => v.id === id);
        if (idx === -1) throw { status: 404, error: 'Visita não encontrada' };

        visits[idx] = { ...visits[idx], ...data };
        saveDB('visits', visits);
        return visits[idx];
      };
    }
  }

  const referralsIdMatch = path.match(/^\/referrals\/([a-zA-Z0-9_-]+)$/);
  if (referralsIdMatch) {
    const id = referralsIdMatch[1];
    if (method === 'PUT') {
      return async (data) => {
        const referrals = getDB('referrals', INITIAL_REFERRALS);
        const idx = referrals.findIndex(r => r.id === id);
        if (idx === -1) throw { status: 404, error: 'Encaminhamento não encontrado' };

        referrals[idx] = { ...referrals[idx], ...data };
        saveDB('referrals', referrals);
        return referrals[idx];
      };
    }
  }

  const reportsIdMatch = path.match(/^\/reports\/([a-zA-Z0-9_-]+)$/);
  if (reportsIdMatch) {
    const id = reportsIdMatch[1];
    if (method === 'GET') {
      return async () => {
        const reports = getDB('reports', INITIAL_REPORTS);
        const report = reports.find(r => r.id === id);
        if (!report) throw { status: 404, error: 'Relatório não encontrado' };
        
        const families = getDB('families', INITIAL_FAMILIES);
        const family = families.find(f => f.id === report.familyId);
        
        const users = getDB('users', INITIAL_USERS);
        const user = users.find(u => u.id === report.userId);

        return {
          ...report,
          family: family || null,
          user: user ? { id: user.id, name: user.name, role: user.role } : null
        };
      };
    }
  }

  const peopleIdMatch = path.match(/^\/people\/([a-zA-Z0-9_-]+)$/);
  if (peopleIdMatch) {
    const id = peopleIdMatch[1];
    if (method === 'PUT') {
      return async (data) => {
        const people = getDB('people', INITIAL_PEOPLE);
        const idx = people.findIndex(p => p.id === id);
        if (idx === -1) throw { status: 404, error: 'Membro familiar não encontrado' };

        people[idx] = { ...people[idx], ...data, age: Number(data.age) || people[idx].age };
        saveDB('people', people);
        return people[idx];
      };
    }
    if (method === 'DELETE') {
      return async () => {
        let people = getDB('people', INITIAL_PEOPLE);
        const person = people.find(p => p.id === id);
        if (!person) throw { status: 404, error: 'Membro familiar não encontrado' };

        people = people.filter(p => p.id !== id);
        saveDB('people', people);

        // Update family memberCount
        const families = getDB('families', INITIAL_FAMILIES);
        const fIdx = families.findIndex(f => f.id === person.familyId);
        if (fIdx !== -1) {
          families[fIdx].memberCount = people.filter(p => p.familyId === person.familyId).length;
          saveDB('families', families);
        }

        return { success: true };
      };
    }
  }

  const notificationsIdMatch = path.match(/^\/notifications\/([a-zA-Z0-9_-]+)\/read$/);
  if (notificationsIdMatch && method === 'PUT') {
    const id = notificationsIdMatch[1];
    return async () => {
      const notifications = getDB('notifications', INITIAL_NOTIFICATIONS);
      const idx = notifications.findIndex(n => n.id === id);
      if (idx !== -1) {
        notifications[idx].isRead = true;
        saveDB('notifications', notifications);
      }
      return { success: true };
    };
  }

  return null;
};

// Custom Axios-like object wrapper
const mockAxiosInstance = {
  interceptors: {
    request: { use: () => {} },
    response: { use: () => {} }
  },

  async get(url, config) {
    await delay();
    const { path, query } = parseUrl(url);
    const handler = getHandler('GET', path);
    if (!handler) {
      throw { response: { status: 404, data: { error: `Endpoint mock GET ${path} não encontrado` } } };
    }
    try {
      const data = await handler(null, query);
      return { data };
    } catch (err) {
      throw { response: { status: err.status || 500, data: { error: err.error || 'Erro interno do servidor mock' } } };
    }
  },

  async post(url, body, config) {
    await delay();
    const { path, query } = parseUrl(url);
    const handler = getHandler('POST', path);
    if (!handler) {
      throw { response: { status: 404, data: { error: `Endpoint mock POST ${path} não encontrado` } } };
    }
    try {
      const data = await handler(body, query);
      return { data };
    } catch (err) {
      throw { response: { status: err.status || 500, data: { error: err.error || 'Erro interno do servidor mock' } } };
    }
  },

  async put(url, body, config) {
    await delay();
    const { path, query } = parseUrl(url);
    const handler = getHandler('PUT', path);
    if (!handler) {
      throw { response: { status: 404, data: { error: `Endpoint mock PUT ${path} não encontrado` } } };
    }
    try {
      const data = await handler(body, query);
      return { data };
    } catch (err) {
      throw { response: { status: err.status || 500, data: { error: err.error || 'Erro interno do servidor mock' } } };
    }
  },

  async delete(url, config) {
    await delay();
    const { path, query } = parseUrl(url);
    const handler = getHandler('DELETE', path);
    if (!handler) {
      throw { response: { status: 404, data: { error: `Endpoint mock DELETE ${path} não encontrado` } } };
    }
    try {
      const data = await handler(null, query);
      return { data };
    } catch (err) {
      throw { response: { status: err.status || 500, data: { error: err.error || 'Erro interno do servidor mock' } } };
    }
  }
};

export default mockAxiosInstance;
