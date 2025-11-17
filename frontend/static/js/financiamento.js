document.addEventListener('DOMContentLoaded', () => {
    // --- Seletores do Simulador ---
    const valorMotoInput = document.getElementById('valor-moto');
    const valorEntradaInput = document.getElementById('valor-entrada');
    const numParcelasSelect = document.getElementById('num-parcelas');
    const valorParcelaDisplay = document.getElementById('valor-parcela');

    const formatCurrency = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    function calcularParcela() {
        const valorMoto = parseFloat(valorMotoInput.value) || 0;
        let valorEntrada = parseFloat(valorEntradaInput.value) || 0;
        const numParcelas = parseInt(numParcelasSelect.value);

        if (valorEntrada > valorMoto) {
            valorEntrada = valorMoto;
            valorEntradaInput.value = valorMoto;
        }

        const taxaJurosMensal = 0.0199;
        const valorFinanciado = valorMoto - valorEntrada;

        if (valorFinanciado <= 0) {
            valorParcelaDisplay.textContent = formatCurrency(0);
            return;
        }

        const parcela = valorFinanciado * (taxaJurosMensal * Math.pow(1 + taxaJurosMensal, numParcelas)) / (Math.pow(1 + taxaJurosMensal, numParcelas) - 1);

        valorParcelaDisplay.textContent = formatCurrency(parcela);
    }

    valorMotoInput.addEventListener('input', calcularParcela);
    valorEntradaInput.addEventListener('input', calcularParcela);
    numParcelasSelect.addEventListener('change', calcularParcela);
    calcularParcela(); // Calcula o valor inicial

    // ==========================================================
    //                 NOVA LÓGICA DO FORMULÁRIO                 
    // ==========================================================
    const financingForm = document.getElementById('financing-form');
    const submitButton = document.getElementById('financing-submit-btn');
    const btnText = submitButton.querySelector('.btn-text');
    const btnLoader = submitButton.querySelector('.btn-loader');
    const formMessage = document.getElementById('form-message');

    financingForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // 1. Ativa o loader
        submitButton.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-flex';
        formMessage.textContent = '';
        formMessage.className = 'login-message-container';

        // 2. Pega os valores (incluindo os do simulador)
        const nome = document.getElementById('nome').value;
        const email = document.getElementById('email').value;
        const telefone = document.getElementById('telefone').value;
        
        const valorMoto = parseFloat(valorMotoInput.value) || 0;
        const valorEntrada = parseFloat(valorEntradaInput.value) || 0;
        const numParcelas = parseInt(numParcelasSelect.value);
        // Converte "R$ 605,90" para 605.90
        const valorParcela = parseFloat(valorParcelaDisplay.textContent.replace('R$', '').replace(/\./g, '').replace(',', '.')) || 0;

        const data = {
            nome, email, telefone,
            valorMoto, valorEntrada, numParcelas, valorParcela
        };

        try {
            const response = await fetch('/api/financiamento', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok) {
                // Sucesso
                formMessage.textContent = 'Proposta enviada com sucesso! Entraremos em contato em breve.';
                formMessage.className = 'login-message-container success';
                financingForm.reset(); // Limpa o formulário de contato
                calcularParcela(); // Recalcula o simulador para os valores padrão
            } else {
                // Erro do servidor
                formMessage.textContent = result.message || 'Erro ao enviar proposta.';
                formMessage.className = 'login-message-container error';
            }

        } catch (error) {
            // Erro de rede
            console.error('Erro no fetch:', error);
            formMessage.textContent = 'Falha de conexão. Tente novamente.';
            formMessage.className = 'login-message-container error';
        } finally {
            // 3. Desativa o loader
            submitButton.disabled = false;
            btnText.style.display = 'inline-block';
            btnLoader.style.display = 'none';
        }
    });
});