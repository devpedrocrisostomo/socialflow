# SocialFlow - Sistema de Gestão para Assistência Social

O **SocialFlow** é um sistema web completo desenvolvido em arquitetura modular (Clean Architecture) e focado em auxiliar assistentes sociais no gerenciamento de atendimentos, famílias, acompanhamentos e relatórios.

---

## 🚀 Arquitetura e Tecnologias

### **Backend (`/backend`)**
* **Core**: Node.js & Express
* **Banco de Dados**: PostgreSQL 16 (Porta: 5432, Senha: `123456`, Database: `socialflow`)
* **ORM**: Prisma ORM v5 (Estabilidade máxima de schema e migrations)
* **Autenticação**: JSON Web Tokens (JWT) e segurança de senhas via `bcryptjs`

### **Frontend (`/frontend`)**
* **Core**: React.js (Vite Core)
* **Estilização**: TailwindCSS v3 (Modo Escuro nativo, design premium com HSL/variáveis estéticas)
* **Consumo de API**: Axios (Cliente centralizado com interceptadores de token JWT e deslogue automático por 401)
* **Gráficos**: Recharts (Gráficos em tempo real no Dashboard)
* **PDFs**: jsPDF (Geração de relatórios com timbre governamental vetorizado diretamente no navegador)

---

## 🔐 Credenciais Padrão (Seed)

O banco de dados já foi devidamente configurado e populado com sementes de teste. Utilize as credenciais abaixo para testar o sistema:

| Cargo / Papel | E-mail corporativo | Senha |
| :--- | :--- | :--- |
| **Administrador (Coordenador)** | `admin@socialflow.com.br` | `123456` |
| **Assistente Social** | `maria@socialflow.com.br` | `123456` |
| **Assistente Social** | `joao@socialflow.com.br` | `123456` |

---

## 🔧 Como Executar Localmente

### 1. Requisitos Prévios
* **Node.js** (v18 ou superior instalado)
* **PostgreSQL** ativo na porta 5432 (Banco `socialflow` criado com a senha `123456`). *O banco e as sementes já foram inicializados no seu PostgreSQL local.*

### 2. Rodar o Backend
Abra um terminal e execute:
```bash
cd backend
npm install
node prisma/seed.js     # Opcional (já executado), recria e popula o banco do zero
npm run dev
```
O servidor Express rodará em `http://localhost:5000`.

### 3. Rodar o Frontend
Em outro terminal, execute:
```bash
cd frontend
npm install
npm run dev
```
Acesse o sistema no navegador através do endereço exibido no terminal (geralmente `http://localhost:5173`).

---

## 🌟 Diferenciais Implementados
1. **Modo Escuro (Dark Mode)**: Tonalidade escura e de alto contraste ideal para uso prolongado por assistentes. Ativável na barra superior (Navbar).
2. **Geração de PDF Vector**: Criação de relatórios e laudos com padrão profissional e timbrado governamental.
3. **Busca Inteligente Global**: Caixa de pesquisa na barra superior que varre famílias, membros, atendimentos e relatórios sociais em tempo real.
4. **Estado de Loading e Validação**: feedbacks visuais premium com loaders circulares, tratamento robusto de erros e prevenção de CPF duplicado.
