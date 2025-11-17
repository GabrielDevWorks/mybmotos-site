document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    // (NOVO) Seleciona o container da mensagem
    const loginMessage = document.getElementById('login-message'); 

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Impede o recarregamento da página

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // (NOVO) Limpa mensagens antigas
        loginMessage.textContent = '';
        loginMessage.className = 'login-message-container';

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                // (MUDANÇA) Remove alert e usa o div
                loginMessage.textContent = 'Login realizado com sucesso! Redirecionando...';
                loginMessage.className = 'login-message-container success'; // Classe de sucesso
                
                // (MUDANÇA) Adiciona um delay para o usuário ler a msg
                setTimeout(() => {
                    window.location.href = '/admin/dashboard'; // Redireciona para o painel
                }, 1000); // 1 segundo de delay

            } else {
                // (MUDANÇA) Remove alert e usa o div
                loginMessage.textContent = 'Usuário ou senha inválidos.';
                loginMessage.className = 'login-message-container error'; // Classe de erro
            }
        } catch (error) {
            console.error('Erro ao tentar fazer login:', error);
            // (MUDANÇA) Remove alert e usa o div
            loginMessage.textContent = 'Ocorreu um erro ao conectar com o servidor.';
            loginMessage.className = 'login-message-container error'; // Classe de erro
        }
    });
});