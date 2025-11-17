require('dotenv').config({ path: require('path').join(__dirname, '.env') });

console.log("🔍 Variáveis de ambiente detectadas:");
console.log({
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_NAME: process.env.DB_NAME,
  DB_PORT: process.env.DB_PORT
});

// --- 1. Importação dos Módulos ---
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const session = require('express-session'); // <-- MÓDULO DE SESSÃO
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// --- 2. Configurações Iniciais ---
const app = express();
const PORT = 3000;

// --- 3. Middlewares ---
app.use(cors()); 
app.use(express.json()); 

// --- CONFIGURAÇÃO DE SESSÃO ---
app.use(session({
  secret: process.env.SESSION_SECRET, // Chave secreta do seu .env
  resave: false,
  saveUninitialized: false, // Não cria sessões até o login
  cookie: { 
    maxAge: 24 * 60 * 60 * 1000, // Duração de 24 horas
    secure: false // O proxy da Brasil Cloud cuida do HTTPS
  } 
}));

// --- CORREÇÃO DE SEGURANÇA: Servir APENAS pastas públicas ---
app.use('/frontend/static', express.static(path.join(__dirname, '../frontend/static')));
app.use('/frontend/assets', express.static(path.join(__dirname, '../frontend/assets')));
// --- FUNÇÃO DE GUARDA (SEGURANÇA) ---
function requireLogin(req, res, next) {
  if (req.session.isLoggedIn) {
    next(); // Utilizador está logado, pode continuar
  } else {
    // Se for um pedido de API, envia erro 401
    if (req.path.startsWith('/api/')) {
      return res.status(401).json({ error: "Acesso não autorizado" });
    }
    // Se for um pedido de página, redireciona para o login
    return res.redirect('/admin/login');
  }
}

// --- 4. Rotas Públicas do Frontend (HTML) ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Removido /index.html (a rota '/' já cuida disso)

app.get('/estoque', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/estoque.html'));
});

app.get('/financiamento', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/financiamento.html'));
});

app.get('/sobre', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/sobre.html'));
});

app.get('/moto-detalhe', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/moto-detalhe.html'));
});
app.get('/vendidos', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/vendidos.html'));
});
// --- Rotas do Admin ---
// A página de login é PÚBLICA
app.get('/admin/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/admin/login.html'));
});

// A página do dashboard é PROTEGIDA
app.get('/admin/dashboard', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/admin/dashboard.html'));
});

app.get('/admin/dashboard-overview', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/admin/dashboard-overview.html'));
});

// Rota para o "estoque-admin" (parcial)
app.get('/admin/estoque-admin', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/admin/estoque-admin.html'));
});
// Rota para o "vendidos-admin" (parcial)
app.get('/admin/vendidos-admin', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/admin/vendidos-admin.html'));
});


app.get('/admin/financiamentos-admin', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/admin/financiamentos-admin.html'));
});
// --- CONFIGURAÇÃO DO CLOUDINARY (NOVO) ---
cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.API_KEY, 
  api_secret: process.env.API_SECRET 
});

// --- CONFIGURAÇÃO DO MULTER (ATUALIZADA) ---
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'mybmotos', // O nome da pasta no Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    format: 'jpg' // Converte tudo para JPG
  }
});
const upload = multer({ storage: storage });


// --- BANCO DE DADOS ---
async function initializeDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      port: process.env.DB_PORT
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
    await connection.end();

    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });
    console.log(`✅ Conectado ao banco de dados ${process.env.DB_NAME} em ${process.env.DB_HOST}:${process.env.DB_PORT}`);

    // Criação de Tabelas (SQL Limpo)
    await pool.query(`CREATE TABLE IF NOT EXISTS usuarios (
id INT AUTO_INCREMENT PRIMARY KEY,
username VARCHAR(255) NOT NULL UNIQUE,
password_hash VARCHAR(255) NOT NULL
);`);

    await pool.query(`CREATE TABLE IF NOT EXISTS motos (
id INT AUTO_INCREMENT PRIMARY KEY,
marca VARCHAR(255) NOT NULL,
modelo VARCHAR(255) NOT NULL,
ano INT NOT NULL,
km INT NOT NULL,
preco DECIMAL(10, 2) NOT NULL,
imagem_url VARCHAR(255),
descricao TEXT,
destaque BOOLEAN DEFAULT 0
);`);

    await pool.query(`CREATE TABLE IF NOT EXISTS moto_imagens (
id INT AUTO_INCREMENT PRIMARY KEY,
moto_id INT NOT NULL,
imagem_url VARCHAR(255) NOT NULL,
FOREIGN KEY (moto_id) REFERENCES motos(id) ON DELETE CASCADE
);`);
// ==========================================================
//                  ADICIONE ESTE BLOCO                  
// ==========================================================
await pool.query(`
    CREATE TABLE IF NOT EXISTS financiamentos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        telefone VARCHAR(50) NOT NULL,
        valor_moto DECIMAL(10,2),
        valor_entrada DECIMAL(10,2),
        num_parcelas INT,
        valor_parcela_simulada DECIMAL(10,2),
        data_solicitacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`);

// ==========================================================

    // Popula dados iniciais
    const [userRows] = await pool.query("SELECT COUNT(*) as count FROM usuarios");
    if (userRows[0].count === 0) {
        console.log('Nenhum usuário encontrado, criando usuário admin...');
        const adminUser = 'admin';
        const adminPass = 'admin123';
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(adminPass, salt);
        await pool.query("INSERT INTO usuarios (username, password_hash) VALUES (?, ?)", [adminUser, passwordHash]);
        console.log('Usuário "admin" com senha "admin123" criado com sucesso.');
    }
    

    return pool;

  } catch (error) {
    console.error('Erro fatal durante a inicialização do banco de dados:', error);
    process.exit(1);
  }
}

async function startServer() {
    const pool = await initializeDatabase(); // Espera o DB estar 100% pronto

    // --- 5. Definição das Rotas da API ---

    // --- ROTAS PÚBLICAS DA API (não precisam de login) ---
    app.get('/api/motos', async (req, res) => {
        try {
            const { marca, keyword } = req.query; 
            let query = "SELECT * FROM motos";
            const params = [];
            const conditions = ["vendido = 0"];  // <-- Aqui já adiciona o filtro correto

            if (marca) {
                conditions.push("UPPER(marca) = UPPER(?)");
                params.push(marca);
            }

            if (keyword) {
                conditions.push("modelo LIKE ?");
                params.push(`%${keyword}%`);
            }

            if (conditions.length > 0) {
                query += " WHERE " + conditions.join(" AND ");
            }

            query += " ORDER BY id DESC";

            const [rows] = await pool.query(query, params);
            res.json({
                message: "success",
                data: rows
            });
        } catch (error) {
            console.error('Erro ao buscar motos:', error);
            res.status(500).json({ "error": error.message });
        }
    });

    app.get('/api/motos/destaques', async (req, res) => {
        try {
            const [rows] = await pool.query("SELECT * FROM motos WHERE destaque = 1 AND vendido = 0 ORDER BY id DESC");
            res.json({
                message: "success",
                data: rows
            });
        } catch (error) {
            console.error('Erro ao buscar motos em destaque:', error);
            res.status(500).json({ "error": error.message });
        }
    });

    app.get('/api/marcas', async (req, res) => {
        try {
            const [rows] = await pool.query("SELECT DISTINCT marca FROM motos ORDER BY marca ASC");
            const marcas = rows.map(row => row.marca);
            res.json({
                message: "success",
                data: marcas
            });
        } catch (error) {
            console.error('Erro ao buscar marcas:', error);
            res.status(500).json({ "error": error.message });
        }
    });
app.get('/api/motos/vendidos', async (req, res) => {
        try {
            const [rows] = await pool.query("SELECT * FROM motos WHERE vendido = 1 ORDER BY id DESC");
            res.json({
                message: "success",
                data: rows
            });
        } catch (error) {
            console.error('Erro ao buscar motos vendidas:', error);
            res.status(500).json({ "error": error.message });
        }
    });

    // ROTA DE DETALHE (AGORA VEM DEPOIS)
    app.get('/api/motos/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const [motoRows] = await pool.query("SELECT * FROM motos WHERE id = ?", [id]);
            if (motoRows.length === 0) {
                return res.status(404).json({ message: "Moto não encontrada" });
            }
            const moto = motoRows[0];
            const [imagensRows] = await pool.query("SELECT id, imagem_url FROM moto_imagens WHERE moto_id = ?", [id]);
            moto.imagens = imagensRows;
            res.json({
                message: "success",
                data: moto
            });
        } catch (error) {
            console.error('Erro ao buscar moto por ID:', error);
            res.status(500).json({ "error": error.message });
        }
    });
app.post('/api/financiamento', async (req, res) => {
    try {
        const { 
            nome, 
            email, 
            telefone, 
            valorMoto, 
            valorEntrada, 
            numParcelas, 
            valorParcela 
        } = req.body;

        // Validação básica
        if (!nome || !email || !telefone) {
            return res.status(400).json({ message: "Nome, email e telefone são obrigatórios." });
        }

        const query = `
            INSERT INTO financiamentos 
            (nome, email, telefone, valor_moto, valor_entrada, num_parcelas, valor_parcela_simulada)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            nome, 
            email, 
            telefone, 
            valorMoto, 
            valorEntrada, 
            numParcelas, 
            valorParcela
        ];
        
        await pool.query(query, params);
        
        res.status(201).json({ message: "Proposta de financiamento enviada com sucesso!" });

    } catch (error) {
        console.error('Erro ao salvar financiamento:', error);
        res.status(500).json({ error: "Erro interno do servidor." });
    }
});

// ==========================================================
    // Rota de login (Cria a sessão)
    app.post('/api/login', async (req, res) => {
        try {
            const { username, password } = req.body;
            const [rows] = await pool.query("SELECT * FROM usuarios WHERE username = ?", [username]);

            if (rows.length === 0) {
                return res.status(401).json({ message: "Credenciais inválidas" });
            }
            const user = rows[0];

            const isPasswordValid = await bcrypt.compare(password, user.password_hash);

            if (!isPasswordValid) {
                return res.status(401).json({ message: "Credenciais inválidas" });
            }
            
            // --- CORREÇÃO DE SEGURANÇA ---
            // Cria a sessão para o utilizador
            req.session.isLoggedIn = true;
            req.session.username = user.username;
            // --- FIM DA CORREÇÃO ---

            return res.json({ message: "Login bem-sucedido" });
        } catch (error) {
            console.error('Erro no login:', error);
            res.status(500).json({ "error": error.message });
        }
    });
    
    // --- ROTA DE LOGOUT ---
    app.get('/api/logout', (req, res) => {
      req.session.destroy(err => {
        if (err) {
          return res.status(500).json({ message: "Erro ao fazer logout" });
        }
        // Redireciona de volta para a página de login
        res.redirect('/admin/login');
      });
    });


app.post('/api/motos', requireLogin, upload.array('imagens', 10), async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { marca, modelo, ano, km, preco, descricao, destaque } = req.body;
        const files = req.files; // 'files' agora contém as respostas do Cloudinary

        if (!files || files.length === 0) {
            return res.status(400).json({ message: "Pelo menos uma imagem é obrigatória." });
        }

        // file.path agora é a URL HTTPS segura do Cloudinary
        const imagem_de_capa = files[0].path; 

        const motoQuery = `INSERT INTO motos (marca, modelo, ano, km, preco, imagem_url, descricao, destaque) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const motoParams = [marca, modelo, parseInt(ano), parseInt(km), parseFloat(preco), imagem_de_capa, descricao, parseInt(destaque) || 0];
        
        const [result] = await connection.query(motoQuery, motoParams);
        const novaMotoId = result.insertId;

        if (files.length > 0) {
            const imagensQuery = 'INSERT INTO moto_imagens (moto_id, imagem_url) VALUES ?';
            // Mapeia os arquivos restantes, file.path é a URL do Cloudinary
            const imagensValues = files.map(file => [
                novaMotoId, 
                file.path 
            ]);
            await connection.query(imagensQuery, [imagensValues]);
        }
        
        await connection.commit();
        res.status(201).json({ message: "Moto cadastrada com sucesso!" });

    } catch (error) {
        await connection.rollback();
        console.error('Erro ao cadastrar moto:', error);
        res.status(500).json({ "error": error.message });
    } finally {
        connection.release();
    }
});

    // Rota para EXCLUIR uma moto
    app.delete('/api/motos/:id', requireLogin, async (req, res) => {
        try {
            const { id } = req.params;
            const [result] = await pool.query("DELETE FROM motos WHERE id = ?", [id]);
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Moto não encontrada" });
            }
            res.json({ message: "Moto excluída com sucesso!" });
        } catch (error) {
            console.error('Erro ao excluir moto:', error);
            res.status(500).json({ "error": error.message });
        }
    });

    // Rota para EXCLUIR uma IMAGEM
    app.delete('/api/imagens/:id', requireLogin, async (req, res) => {
        try {
            const { id } = req.params;
            const [result] = await pool.query("DELETE FROM moto_imagens WHERE id = ?", [id]);
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Imagem não encontrada" });
            }
            res.json({ message: "Imagem excluída com sucesso!" });
        } catch (error) {
            console.error('Erro ao excluir imagem:', error);
            res.status(500).json({ "error": error.message });
        }
    });

 app.put('/api/motos/:id', requireLogin, upload.array('imagens', 10), async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { id } = req.params;
        const { marca, modelo, ano, km, preco, descricao, destaque } = req.body;
        const files = req.files; // Novas imagens (se houver)

        const updateMotoQuery = `
            UPDATE motos SET 
            marca = ?, modelo = ?, ano = ?, km = ?, preco = ?, descricao = ?, destaque = ?
            WHERE id = ?
        `;
        const motoParams = [marca, modelo, ano, km, preco, descricao, destaque, id];
        await connection.query(updateMotoQuery, motoParams);

        // Se o usuário enviou NOVAS imagens
        if (files && files.length > 0) {
            const imagensQuery = 'INSERT INTO moto_imagens (moto_id, imagem_url) VALUES ?';
            const imagensValues = files.map(file => [
                id, 
                file.path // file.path é a URL do Cloudinary
            ]);
            await connection.query(imagensQuery, [imagensValues]);

            // Atualiza a imagem de capa se enviou novas imagenssd
            const novaImagemCapa = files[0].path;
            await connection.query('UPDATE motos SET imagem_url = ? WHERE id = ?', [novaImagemCapa, id]);
        }

        await connection.commit();
        res.json({ message: "Moto atualizada com sucesso!" });
    } catch (error) {
        await connection.rollback();
        console.error('Erro ao atualizar moto:', error);
        res.status(500).json({ "error": error.message });
    } finally {
        connection.release();
    }
});


// ROTA PARA MARCAR MOTO COMO VENDIDA (PROTEGIDA)
        app.put('/api/motos/:id/vender', requireLogin, async (req, res) => {
            try {
                const { id } = req.params;
                const [result] = await pool.query("UPDATE motos SET vendido = 1 WHERE id = ?", [id]);
                
                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: "Moto não encontrada" });
                }
                res.json({ message: "Moto marcada como vendida!" });

            } catch (error) {
                console.error('Erro ao vender moto:', error);
                res.status(500).json({ "error": error.message });
            }
        });

// ==========================================================
// ROTA PARA "RE-LISTAR" (VOLTAR AO ESTOQUE) - (PROTEGIDA)
// ==========================================================
        app.put('/api/motos/:id/relist', requireLogin, async (req, res) => {
            try {
                const { id } = req.params;
                // Define vendido = 0 para voltar ao estoque
                const [result] = await pool.query("UPDATE motos SET vendido = 0 WHERE id = ?", [id]);
                
                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: "Moto não encontrada" });
                }
                res.json({ message: "Moto retornou ao estoque!" });

            } catch (error) {
                console.error('Erro ao re-listar moto:', error);
                res.status(500).json({ "error": error.message });
            }
        });
// ==========================================================
    // ROTA PARA ESTATÍSTICAS DO DASHBOARD (PROTEGIDA)
    app.get('/api/dashboard/stats', requireLogin, async (req, res) => {
        try {
            const [totalResult] = await pool.query("SELECT COUNT(*) as totalMotos FROM motos");
            const [destaqueResult] = await pool.query("SELECT COUNT(*) as totalDestaques FROM motos WHERE destaque = 1");
            const [recentesResult] = await pool.query("SELECT * FROM motos ORDER BY id DESC LIMIT 5");
            const totalFinanciamentos = 0; 

            res.json({
                message: "success",
                data: {
                    totalMotos: totalResult[0].totalMotos,
                    totalDestaques: destaqueResult[0].totalDestaques,
                    totalFinanciamentos: totalFinanciamentos,
                    recentes: recentesResult
                }
          });
        } catch (error) {
            console.error('Erro ao buscar estatísticas do dashboard:', error);
            res.status(500).json({ "error": error.message });
        }
    });

app.get('/api/financiamentos', requireLogin, async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT *, DATE_FORMAT(data_solicitacao, '%d/%m/%Y às %H:%i') as data_formatada FROM financiamentos ORDER BY data_solicitacao DESC"
        );
        res.json({
            message: "success",
            data: rows
        });
    } catch (error) {
        console.error('Erro ao buscar financiamentos:', error);
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/financiamentos/:id', requireLogin, async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query("DELETE FROM financiamentos WHERE id = ?", [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Proposta não encontrada" });
        }
        res.json({ message: "Proposta excluída com sucesso!" });
    } catch (error) {
        console.error('Erro ao excluir proposta:', error);
        res.status(500).json({ error: error.message });
    }
});




    // --- 6. Inicialização do Servidor ---
    app.listen(PORT, () => {
        console.log(`Servidor rodando em http://localhost:${PORT}`);
       console.log(`Frontend disponível em http://localhost:3000/`);
        console.log(`Admin disponível em http://localhost:3000/admin/dashboard.html`);
    });
}

// --- 7. Execução Principal ---
startServer();