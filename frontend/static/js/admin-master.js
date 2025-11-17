/* ==============================================
    O "CÉREBRO" DO PAINEL ADMIN - admin-master.js
    (Versão Atualizada com Modais Customizados e Correção de Upload)
   =============================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ==============================================
    // 1. SELETORES DE ELEMENTOS
    // ==============================================

    // --- Seletores Gerais ---
    const mainContentArea = document.getElementById('main-content-area');
    const mainContentTitle = document.getElementById('main-content-title');
    const allNavLinks = document.querySelectorAll('.nav-link[data-target]');

    // --- Seletores Modal "Adicionar" ---
    const addModalOverlay = document.getElementById('add-modal-overlay');
    const btnAbrirModalAdd = document.getElementById('btn-abrir-modal-add');
    const btnFecharModalAdd = document.getElementById('add-modal-close-btn');
    const addForm = document.getElementById('add-moto-form');
    const addImageInput = document.getElementById('add-imagens');
    const addImagePreviewContainer = document.getElementById('add-image-preview-container');
    // Array global para armazenar os arquivos do modal "Adicionar"
    let addModalFiles = [];

    // --- Seletores Modal "Editar" ---
    const editModalOverlay = document.getElementById('edit-modal-overlay');
    const btnFecharModalEdit = document.getElementById('edit-modal-close-btn');
    const editForm = document.getElementById('edit-moto-form');
    const editCurrentImagesContainer = document.getElementById('edit-image-current-container');
    const editNewImageInput = document.getElementById('edit-imagens');
    const editNewImagePreviewContainer = document.getElementById('edit-image-preview-container');
    // Array global para armazenar os arquivos NOVOS do modal "Editar"
    let editModalFiles = [];

    // --- Seletores Modal "Vender" ---
    const sellModalOverlay = document.getElementById('sell-modal-overlay');
    const btnFecharModalSell = document.getElementById('sell-modal-close-btn');
    const btnConfirmarModalSell = document.getElementById('sell-modal-confirm-btn');
    const sellMotoIdInput = document.getElementById('sell-moto-id');

    // --- Seletores Modal "Excluir Permanente" ---
    const deletePermanentModalOverlay = document.getElementById('delete-permanent-modal-overlay');
    const btnFecharModalDeletePermanent = document.getElementById('delete-permanent-close-btn');
    const btnConfirmarModalDeletePermanent = document.getElementById('delete-permanent-confirm-btn');
    const deletePermanentMotoIdInput = document.getElementById('delete-permanent-moto-id');

    // --- Seletores Menu Mobile Admin ---
    const sidebar = document.getElementById('admin-sidebar');
    const toggleBtn = document.getElementById('admin-menu-toggle-btn');
    const overlay = document.getElementById('admin-menu-overlay');
    const mainContent = document.querySelector('.main-content');
    const btnAbrirModalAddMobile = document.getElementById('btn-abrir-modal-add-mobile');

    // --- (NOVO) Seletores Modal de Notificação (Substitui 'alert') ---
    const notificationModalOverlay = document.getElementById('notification-modal-overlay');
    const notificationModal = document.getElementById('notification-modal');
    const notificationIcon = notificationModal ? notificationModal.querySelector('.modal-icon i') : null;
    const notificationTitle = document.getElementById('notification-title');
    const notificationMessage = document.getElementById('notification-message');
    const notificationCloseBtn = document.getElementById('notification-close-btn');

    // --- (NOVO) Seletores Modal de Confirmação (Substitui 'confirm') ---
    const confirmationModalOverlay = document.getElementById('confirmation-modal-overlay');
    const confirmationMessage = document.getElementById('confirmation-message');
    const confirmationCloseBtn = document.getElementById('confirmation-close-btn');
    const confirmationCancelBtn = document.getElementById('confirmation-cancel-btn');
    const confirmationConfirmBtn = document.getElementById('confirmation-confirm-btn');
    let confirmationCallback = null; // Armazena a ação a ser executada

    // ==============================================
    // 2. LÓGICA DO MENU ADMIN (MOBILE)
    // ==============================================
    if (sidebar && toggleBtn && overlay && mainContent) {

        const openMenu = () => {
            sidebar.classList.add('is-open');
            overlay.classList.add('is-open');
            mainContent.style.overflow = 'hidden';
        };

        const closeMenu = () => {
            sidebar.classList.remove('is-open');
            overlay.classList.remove('is-open');
            mainContent.style.overflow = '';
        };

        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openMenu();
        });

        overlay.addEventListener('click', closeMenu);

        sidebar.querySelectorAll('.nav-link').forEach(link => {
            if (link.id !== 'btn-abrir-modal-add') {
                link.addEventListener('click', closeMenu);
            }
        });
    }
    // --- FIM DA LÓGICA DO MENU ---

    // ==============================================
    // 3. (NOVO) FUNÇÕES DOS MODAIS GLOBAIS
    // ==============================================

    /**
     * Exibe o modal de notificação (substituto do 'alert')
     * @param {string} message - A mensagem a ser exibida.
     * @param {boolean} isError - Se verdadeiro, exibe o modal como erro.
     */
    function showNotificationModal(message, isError = false) {
        if (!notificationModalOverlay || !notificationModal) {
            // fallback: console + alert
            console[isError ? 'error' : 'log'](message);
            if (isError) alert(message);
            return;
        }

        if (notificationMessage) notificationMessage.textContent = message;

        if (notificationIcon) {
            notificationIcon.classList.remove('fa-check-circle', 'fa-times-circle');
            notificationIcon.classList.add('fa-solid');
        }
        if (notificationModal) {
            notificationModal.classList.remove('modal--success', 'modal--error');
        }

        if (isError) {
            if (notificationTitle) notificationTitle.textContent = "Erro!";
            if (notificationIcon) notificationIcon.classList.add('fa-times-circle');
            if (notificationModal) notificationModal.classList.add('modal--error');
        } else {
            if (notificationTitle) notificationTitle.textContent = "Sucesso!";
            if (notificationIcon) notificationIcon.classList.add('fa-check-circle');
            if (notificationModal) notificationModal.classList.add('modal--success');
        }

        notificationModalOverlay.classList.add('is-visible');
    }

    // --- Listeners para fechar o modal de notificação ---
    if (notificationCloseBtn) {
        notificationCloseBtn.addEventListener('click', () => {
            if (notificationModalOverlay) notificationModalOverlay.classList.remove('is-visible');
        });
    }
    if (notificationModalOverlay) {
        notificationModalOverlay.addEventListener('click', (e) => {
            if (e.target === notificationModalOverlay) {
                notificationModalOverlay.classList.remove('is-visible');
            }
        });
    }

    /**
     * Exibe o modal de confirmação (substituto do 'confirm')
     * @param {string} message - A pergunta de confirmação.
     * @param {function} onConfirm - A função a ser executada se o usuário clicar em "Sim".
     */
    function showConfirmationModal(message, onConfirm) {
        if (!confirmationModalOverlay || !confirmationMessage) {
            // fallback to native confirm
            if (confirm(message) && typeof onConfirm === 'function') onConfirm();
            return;
        }

        confirmationMessage.textContent = message;
        confirmationCallback = onConfirm; // Armazena a função
        confirmationModalOverlay.classList.add('is-visible');
    }

    // --- Listeners para o modal de confirmação ---
    function closeConfirmationModal() {
        if (confirmationModalOverlay) confirmationModalOverlay.classList.remove('is-visible');
        confirmationCallback = null;
    }

    if (confirmationCloseBtn) confirmationCloseBtn.addEventListener('click', closeConfirmationModal);
    if (confirmationCancelBtn) confirmationCancelBtn.addEventListener('click', closeConfirmationModal);
    if (confirmationModalOverlay) {
        confirmationModalOverlay.addEventListener('click', (e) => {
            if (e.target === confirmationModalOverlay) {
                closeConfirmationModal();
            }
        });
    }
    if (confirmationConfirmBtn) {
        confirmationConfirmBtn.addEventListener('click', () => {
            if (typeof confirmationCallback === 'function') {
                try {
                    confirmationCallback(); // Executa a ação armazenada
                } catch (err) {
                    console.error('Erro no callback de confirmação:', err);
                }
            }
            closeConfirmationModal(); // Fecha o modal
        });
    }

    // ==============================================
    // 4. NAVEGAÇÃO SPA (Single Page Application)
    // ==============================================

    async function loadContent(url, targetId, callback) {
        if (!mainContentArea) return;
        try {
            mainContentArea.innerHTML = '<div style="text-align:center; padding: 40px;">Carregando...</div>';

            const response = await fetch(`/admin/${url}`);
            if (!response.ok) {
                throw new Error(`Erro ao carregar ${url}: ${response.statusText}`);
            }
            const html = await response.text();
            mainContentArea.innerHTML = html;

            const activeLink = document.querySelector(`.nav-link[data-target="${targetId}"]`);
            if (activeLink && mainContentTitle) {
                const span = activeLink.querySelector('span');
                mainContentTitle.textContent = span ? span.textContent : mainContentTitle.textContent;
            }

            document.querySelectorAll('.nav-link[data-target]').forEach(link => link.classList.remove('active'));
            document.querySelectorAll(`.nav-link[data-target="${targetId}"]`).forEach(link => link.classList.add('active'));

            if (callback) {
                try { callback(); } catch (err) { console.error('Erro no callback de loadContent:', err); }
            }

        } catch (error) {
            console.error('Erro ao carregar conteúdo:', error);
            mainContentArea.innerHTML = '<div style="text-align:center; padding: 40px; color: red;">Falha ao carregar conteúdo.</div>';
        }
    }

    // --- Lógica de Navegação (Links) ---
    if (allNavLinks && allNavLinks.length > 0) {
        allNavLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();

                // (MODIFICAÇÃO 3) Adicionamos 'btn-abrir-modal-add-mobile'
                if (link.id === 'btn-abrir-modal-add' || link.id === 'btn-abrir-modal-add-mobile' || link.classList.contains('logout')) {
                    return;
                }

                const url = link.getAttribute('href');
                const targetId = link.dataset.target;

                let callback = null;
                if (targetId === 'dashboard-overview') {
                    callback = fetchDashboardData;
                } else if (targetId === 'estoque-admin') {
                    callback = () => fetchAndRenderMotos('/api/motos');
                } else if (targetId === 'vendidos-admin') {
                    callback = () => fetchAndRenderMotos('/api/motos/vendidos');
                // (MODIFICAÇÃO 9) Adiciona o case para financiamentos
                } else if (targetId === 'financiamentos-admin') {
                    callback = fetchAndRenderFinanciamentos;
                }

                loadContent(url, targetId, callback);
            });
        });
    }

    // --- Carregamento Inicial ---
    // (MODIFICAÇÃO 7) Remove .html da rota inicial
    loadContent('dashboard-overview', 'dashboard-overview', fetchDashboardData);

    // ==============================================
    // 5. LÓGICA DO DASHBOARD (OVERVIEW)
    // ==============================================

    async function fetchDashboardData() {
        const statsTotalMotos = document.getElementById('stats-total-motos');
        const statsTotalDestaques = document.getElementById('stats-total-destaques');
        const statsTotalFinanciamentos = document.getElementById('stats-total-financiamentos');
        const recentMotosBody = document.getElementById('recent-motos-body');

        try {
            const response = await fetch('/api/dashboard/stats');
            if (!response.ok) throw new Error('Erro ao buscar dados da API');

            const result = await response.json();
            const data = result.data || {};

            if (statsTotalMotos) statsTotalMotos.textContent = data.totalMotos ?? 0;
            if (statsTotalDestaques) statsTotalDestaques.textContent = data.totalDestaques ?? 0;
            if (statsTotalFinanciamentos) statsTotalFinanciamentos.textContent = data.totalFinanciamentos ?? 0;
            if (recentMotosBody) renderRecentMotos(data.recentes || [], recentMotosBody);

        } catch (error) {
            console.error('Erro ao carregar dashboard:', error);
            if (recentMotosBody) {
                recentMotosBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Erro ao carregar dados.</td></tr>`;
            }
        }
    }

    function renderRecentMotos(motos, tableBody) {
        if (!tableBody) return;
        if (!motos || motos.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Nenhuma moto cadastrada recentemente.</td></tr>`;
            return;
        }
        tableBody.innerHTML = '';
        motos.forEach(moto => {
            const precoFormatado = parseFloat(moto.preco || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

            const row = `
                <tr>
                    <td>
                        <div class="recent-moto-info">
                            <img src="${moto.imagem_url || ''}" alt="${moto.modelo || ''}" class="recent-moto-img">
                            <span class="recent-moto-title">${moto.marca || ''} ${moto.modelo || ''}</span>
                        </div>
                    </td>
                    <td>${precoFormatado}</td>
                    <td>${moto.ano || ''}</td>
                    <td>
                        <a href="#" class="btn-details-admin" data-nav-to="estoque-admin">Ver Estoque</a>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    }

    // --- Delegação de Evento para o link "Ver Estoque" da tabela ---
    if (mainContentArea) {
        mainContentArea.addEventListener('click', (e) => {
            if (e.target && e.target.dataset && e.target.dataset.navTo === 'estoque-admin') {
                e.preventDefault();
                const targetLink = document.querySelector('.nav-link[data-target="estoque-admin"]');
                if (targetLink) targetLink.click();
            }
        });
    }

    // ==============================================
    // 6. LÓGICA DO ESTOQUE E VENDIDOS (RENDERIZAÇÃO)
    // ==============================================

    async function fetchAndRenderMotos(apiUrl = '/api/motos') {
        const listBody = document.getElementById('moto-list-body');
        if (!listBody) return;

        listBody.innerHTML = '<div class="list-empty-message">Carregando motos...</div>';
        try {
            const response = await fetch(apiUrl);
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Erro ao buscar motos');

            const motos = result.data || [];
            listBody.innerHTML = '';

            if (motos.length === 0) {
                listBody.innerHTML = '<div class="list-empty-message">Nenhuma moto encontrada.</div>';
                return;
            }

            motos.forEach(moto => {
                const precoFormatado = parseFloat(moto.preco || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                const isSold = moto.vendido == 1;

                const motoCard = `
                    <article class="moto-list-item" data-id="${moto.id}">
                        <div class="col-info">
                            <img src="${moto.imagem_url || ''}" alt="${moto.modelo || ''}" class="item-moto-img">
                            <div class="item-moto-details">
                                <span class="item-moto-title">${moto.marca || ''} ${moto.modelo || ''}</span>
                                <span class="item-moto-id">ID: #${moto.id}</span>
                            </div>
                        </div>
                        <div class="col-preco">${precoFormatado}</div>
                        <div class="col-ano">${moto.ano || ''}</div>
                        <div class="col-acoes">
                            ${isSold ? `
                            <button class="btn-action-text btn-view" title="Editar Anúncio Vendido">Editar Anúncio</button>
                            <button class="btn-action-text btn-relist" title="Colocar à Venda">
                                <i class="fa-solid fa-arrow-rotate-left"></i> <span>Voltar ao Estoque</span>
                            </button>
                            <button class="btn-action-icon btn-delete-permanent" title="Excluir Permanentemente">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                            ` : `
                            <button class="btn-action-text btn-view" title="Ver Detalhes/Editar">Editar</button>
                            <button class="btn-action-text btn-sell" title="Vender Moto" style="border-color: #28a745; color: #28a745;">Vender</button>
                            <button class="btn-action-icon btn-delete" title="Excluir">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                            `}
                        </div>
                    </article>
                `;
                listBody.innerHTML += motoCard;
            });
        } catch (error) {
            console.error('Erro ao popular a lista:', error);
            listBody.innerHTML = '<div class="list-empty-message">Erro ao carregar os dados.</div>';
        }
    }

    // ==============================================
    // 7. LÓGICA DOS BOTÕES DA LISTA (Click Listeners)
    // ==============================================

    async function openEditModal(motoId) {
        // (MODIFICAÇÃO 5) Limpa arrays globais
        editModalFiles = [];
        if (editNewImagePreviewContainer) editNewImagePreviewContainer.innerHTML = '';

        try {
            const response = await fetch(`/api/motos/${motoId}`);
            if (!response.ok) throw new Error('Falha ao buscar dados da moto.');

            const result = await response.json();
            const moto = result.data || {};

            const elSet = id => document.getElementById(id);
            if (elSet('edit-moto-id')) elSet('edit-moto-id').value = moto.id || '';
            if (elSet('edit-marca')) elSet('edit-marca').value = moto.marca || '';
            if (elSet('edit-modelo')) elSet('edit-modelo').value = moto.modelo || '';
            if (elSet('edit-ano')) elSet('edit-ano').value = moto.ano || '';
            if (elSet('edit-km')) elSet('edit-km').value = moto.km || '';
            if (elSet('edit-preco')) elSet('edit-preco').value = moto.preco || '';
            if (elSet('edit-descricao')) elSet('edit-descricao').value = moto.descricao || '';
            if (elSet('edit-destaque')) elSet('edit-destaque').value = moto.destaque ? '1' : '0';

            if (editCurrentImagesContainer) editCurrentImagesContainer.innerHTML = '';

            const allImages = [
                { id: null, imagem_url: moto.imagem_url, is_capa: true },
                ...(moto.imagens || []).filter(img => img.imagem_url !== moto.imagem_url)
            ];

            allImages.forEach(img => {
                const imgContainer = document.createElement('div');
                imgContainer.classList.add('image-preview-wrapper');
                const imageEl = document.createElement('img');
                imageEl.src = img.imagem_url || '';
                imageEl.classList.add('image-preview');
                imgContainer.appendChild(imageEl);

                if (!img.is_capa && img.id) {
                    const deleteBtn = document.createElement('button');
                    deleteBtn.type = 'button';
                    deleteBtn.className = 'btn-delete-image';
                    deleteBtn.innerHTML = '×';
                    deleteBtn.title = 'Excluir Imagem';
                    deleteBtn.dataset.imageId = img.id;
                    imgContainer.appendChild(deleteBtn);
                } else if (img.is_capa) {
                    const capaTag = document.createElement('span');
                    capaTag.className = 'capa-tag';
                    capaTag.textContent = 'Capa';
                    imgContainer.appendChild(capaTag);
                }
                if (editCurrentImagesContainer) editCurrentImagesContainer.appendChild(imgContainer);
            });

            if (editNewImagePreviewContainer) editNewImagePreviewContainer.innerHTML = '';
            if (editNewImageInput) editNewImageInput.value = '';

            if (editModalOverlay) editModalOverlay.classList.add('is-visible');
        } catch (error) {
            console.error('Erro ao abrir modal de edição:', error);
            showNotificationModal(error.message || 'Erro ao abrir edição', true);
        }
    }

    // --- Delegação de Eventos para a lista (Estoque E Vendidos) ---
    if (mainContentArea) {
        mainContentArea.addEventListener('click', async (event) => {
            const viewButton = event.target.closest ? event.target.closest('.btn-view') : null;
            const deleteButton = event.target.closest ? event.target.closest('.btn-delete') : null;
            const sellButton = event.target.closest ? event.target.closest('.btn-sell') : null;
            const relistButton = event.target.closest ? event.target.closest('.btn-relist') : null;
            const deletePermanentButton = event.target.closest ? event.target.closest('.btn-delete-permanent') : null;
            // (MODIFICAÇÃO 9) Seletor para deletar financiamento
            const deleteFinanciamentoButton = event.target.closest ? event.target.closest('.btn-delete-financiamento') : null;

            // --- Ação: Ver/Editar ---
            if (viewButton) {
                const motoId = viewButton.closest('.moto-list-item').dataset.id;
                openEditModal(motoId);
            }

            // --- Ação: Vender (Abre modal 'sell-modal') ---
            if (sellButton) {
                const motoId = sellButton.closest('.moto-list-item').dataset.id;
                openSellModal(motoId);
            }

            // --- Ação: Excluir (do Estoque) ---
            if (deleteButton) {
                const motoId = deleteButton.closest('.moto-list-item').dataset.id;

                showConfirmationModal(`Tem certeza que deseja excluir a moto #${motoId}?`, async () => {
                    try {
                        const response = await fetch(`/api/motos/${motoId}`, { method: 'DELETE' });
                        if (!response.ok) throw new Error('Falha ao excluir a moto.');
                        showNotificationModal('Moto excluída com sucesso!');
                        const activeLink = document.querySelector('.nav-link.active');
                        if (activeLink && activeLink.dataset.target === 'vendidos-admin') {
                            fetchAndRenderMotos('/api/motos/vendidos');
                        } else {
                            fetchAndRenderMotos('/api/motos');
                        }
                    } catch (error) {
                        console.error('Erro ao deletar moto:', error);
                        showNotificationModal(error.message || 'Erro ao deletar', true);
                    }
                });
            }

            // --- Ação: Re-listar (Voltar ao Estoque) ---
            if (relistButton) {
                const motoId = relistButton.closest('.moto-list-item').dataset.id;

                showConfirmationModal(`Tem certeza que deseja colocar a moto #${motoId} de volta no estoque?`, async () => {
                    try {
                        const response = await fetch(`/api/motos/${motoId}/relist`, { method: 'PUT' });
                        if (!response.ok) throw new Error('Falha ao re-listar a moto.');
                        showNotificationModal('Moto de volta ao estoque!');
                        fetchAndRenderMotos('/api/motos/vendidos');
                    } catch (error) {
                        console.error('Erro ao re-listar:', error);
                        showNotificationModal(error.message || 'Erro ao re-listar', true);
                    }
                });
            }

            // --- Ação: Excluir Permanente (Abre modal 'delete-permanent-modal') ---
            if (deletePermanentButton) {
                const motoId = deletePermanentButton.closest('.moto-list-item').dataset.id;
                openDeletePermanentModal(motoId);
            }

            // (MODIFICAÇÃO 9) Ação para Deletar Financiamento
            if (deleteFinanciamentoButton) {
                const propostaId = deleteFinanciamentoButton.closest('.financiamento-list-item').dataset.id;
                
                showConfirmationModal(`Tem certeza que deseja excluir esta proposta?`, async () => {
                    try {
                        const response = await fetch(`/api/financiamentos/${propostaId}`, { method: 'DELETE' });
                        if (!response.ok) throw new Error('Falha ao excluir a proposta.');
                        showNotificationModal('Proposta excluída com sucesso!');
                        fetchAndRenderFinanciamentos(); // Recarrega a lista
                    } catch (error) {
                        console.error('Erro ao deletar proposta:', error);
                        showNotificationModal(error.message || 'Erro ao deletar', true);
                    }
                });
            }
        });
    }

    // ==============================================
    // 8. MODAL DE EDIÇÃO (Formulário e Imagens)
    // ==============================================

    // --- Fechar Modal de Edição ---
    function closeEditModal() {
        if (editModalOverlay) editModalOverlay.classList.remove('is-visible');
        // (MODIFICAÇÃO 5) Limpa array global
        editModalFiles = [];
    }
    if (btnFecharModalEdit) btnFecharModalEdit.addEventListener('click', closeEditModal);
    if (editModalOverlay) {
        editModalOverlay.addEventListener('click', (e) => {
            if (e.target === editModalOverlay) closeEditModal();
        });
    }

    // --- Envio do Formulário de Edição ---
    if (editForm) {
        editForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const motoId = document.getElementById('edit-moto-id') ? document.getElementById('edit-moto-id').value : null;

            // (MODIFICAÇÃO 5) Usa FormData e envia 'editModalFiles'
            const formData = new FormData(event.target);

            // Adiciona os novos arquivos do array global
            editModalFiles.forEach((file) => {
                formData.append('imagens', file, file.name);
            });

            // Validação (se não houver imagens atuais E não houver novas)
            const currentImages = editCurrentImagesContainer ? editCurrentImagesContainer.querySelectorAll('img').length : 0;
            if (currentImages === 0 && editModalFiles.length === 0) {
                 showNotificationModal('A moto deve ter pelo menos uma imagem.', true);
                 return;
            }
            
            try {
                const response = await fetch(`/api/motos/${motoId}`, {
                    method: 'PUT',
                    body: formData,
                });
                if (!response.ok) throw new Error('Falha ao salvar as alterações.');
                closeEditModal();
                fetchAndRenderMotos('/api/motos'); // Sempre recarrega o estoque principal
                showNotificationModal('Moto atualizada com sucesso!');
            } catch (error) {
                console.error('Erro ao salvar alteração:', error);
                showNotificationModal(error.message || 'Erro ao salvar', true);
            }
        });
    }

    // (MODIFICAÇÃO 5) Nova função de renderização para o preview do "Editar"
    /**
     * Renderiza os previews de NOVAS imagens no modal "Editar"
     */
    function renderEditModalPreviews() {
        if (!editNewImagePreviewContainer) return;
        editNewImagePreviewContainer.innerHTML = ''; // Limpa os previews antigos

        editModalFiles.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const wrapper = document.createElement('div');
                wrapper.classList.add('image-preview-wrapper');

                const img = document.createElement('img');
                img.src = e.target.result;
                img.classList.add('image-preview');
                wrapper.appendChild(img);

                const deleteBtn = document.createElement('button');
                deleteBtn.type = 'button';
                deleteBtn.className = 'btn-delete-image';
                deleteBtn.innerHTML = '×';
                deleteBtn.title = 'Remover Imagem';
                deleteBtn.dataset.index = index; // Armazena o índice do arquivo
                wrapper.appendChild(deleteBtn);

                editNewImagePreviewContainer.appendChild(wrapper);
            };
            reader.readAsDataURL(file);
        });
    }

    // --- (MODIFICAÇÃO 5) Preview de Novas Imagens (Edição) ---
    if (editNewImageInput) {
        editNewImageInput.addEventListener('change', () => {
            const newFiles = Array.from(editNewImageInput.files);
            editModalFiles = editModalFiles.concat(newFiles);
            renderEditModalPreviews(); // Usa a nova função
            editNewImageInput.value = ''; // Limpa o input
        });
    }

    // (MODIFICAÇÃO 5) Click listener para X das novas imagens (Editar)
    if (editNewImagePreviewContainer) {
        editNewImagePreviewContainer.addEventListener('click', (event) => {
            if (event.target.classList && event.target.classList.contains('btn-delete-image')) {
                const indexToRemove = parseInt(event.target.dataset.index, 10);
                editModalFiles.splice(indexToRemove, 1);
                renderEditModalPreviews(); // Re-renderiza
            }
        });
    }

    // --- Excluir Imagem Individual (Edição) ---
    if (editCurrentImagesContainer) {
        editCurrentImagesContainer.addEventListener('click', async (event) => {
            if (event.target.classList && event.target.classList.contains('btn-delete-image')) {
                const deleteBtn = event.target;
                const imageId = deleteBtn.dataset.imageId;

                showConfirmationModal(`Tem certeza que deseja excluir esta imagem?`, async () => {
                    try {
                        const response = await fetch(`/api/imagens/${imageId}`, { method: 'DELETE' });
                        if (!response.ok) throw new Error('Falha ao excluir a imagem.');
                        deleteBtn.parentElement.remove();
                        showNotificationModal('Imagem excluída com sucesso!');
                    } catch (error) {
                        console.error('Erro ao deletar imagem:', error);
                        showNotificationModal(error.message || 'Erro ao deletar imagem', true);
                    }
                });
            }
        });
    }

    // ==============================================
    // 9. MODAL DE ADIÇÃO (ADICIONAR MOTO)
    // ==============================================

    // --- Abrir e Fechar Modal "Adicionar" ---
    function openAddModal() {
        if (addModalOverlay) addModalOverlay.classList.add('is-visible');
    }
    function closeAddModal() {
        if (addModalOverlay) addModalOverlay.classList.remove('is-visible');
        if (addForm) addForm.reset();
        if (addImagePreviewContainer) addImagePreviewContainer.innerHTML = '';
        // (MODIFICAÇÃO 1) Limpa o array global ao fechar
        addModalFiles = [];
    }

    if (btnAbrirModalAdd) {
        btnAbrirModalAdd.addEventListener('click', (e) => {
            e.preventDefault();
            openAddModal();
        });
    }

    if (btnAbrirModalAddMobile) {
        btnAbrirModalAddMobile.addEventListener('click', (e) => {
            e.preventDefault();
            openAddModal();
        });
    }

    if (btnFecharModalAdd) btnFecharModalAdd.addEventListener('click', closeAddModal);
    if (addModalOverlay) {
        addModalOverlay.addEventListener('click', (e) => {
            if (e.target === addModalOverlay) closeAddModal();
        });
    }

    // (MODIFICAÇÃO 1) Nova função de renderização para "Adicionar"
    /**
     * Renderiza os previews no modal "Adicionar" com base no array addModalFiles
     */
    function renderAddModalPreviews() {
        if (!addImagePreviewContainer) return;
        addImagePreviewContainer.innerHTML = ''; // Limpa os previews antigos

        addModalFiles.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                // 1. Cria o wrapper (igual ao do modal de edição)
                const wrapper = document.createElement('div');
                wrapper.classList.add('image-preview-wrapper');

                // 2. Cria a imagem
                const img = document.createElement('img');
                img.src = e.target.result;
                img.classList.add('image-preview');
                wrapper.appendChild(img);

                // 3. Cria o botão de excluir
                const deleteBtn = document.createElement('button');
                deleteBtn.type = 'button';
                deleteBtn.className = 'btn-delete-image'; // Reutiliza o CSS do modal de edição
                deleteBtn.innerHTML = '×';
                deleteBtn.title = 'Remover Imagem';
                deleteBtn.dataset.index = index; // Armazena o índice do arquivo
                wrapper.appendChild(deleteBtn);

                // 4. Adiciona tudo ao container
                addImagePreviewContainer.appendChild(wrapper);
            };
            reader.readAsDataURL(file);
        });
    }

    // --- (MODIFICAÇÃO 1) Preview de Imagens (Adicionar) ---
    if (addImageInput && addImagePreviewContainer) {
        addImageInput.addEventListener('change', () => {
            const newFiles = Array.from(addImageInput.files);
            addModalFiles = addModalFiles.concat(newFiles);
            renderAddModalPreviews();
            addImageInput.value = ''; // Limpa o input
        });
    }

    // (MODIFICAÇÃO 1) Click listener para X das imagens (Adicionar)
    if (addImagePreviewContainer) {
        addImagePreviewContainer.addEventListener('click', (event) => {
            // Verifica se o clique foi no botão de deletar
            if (event.target.classList && event.target.classList.contains('btn-delete-image')) {
                const indexToRemove = parseInt(event.target.dataset.index, 10);
                addModalFiles.splice(indexToRemove, 1);
                renderAddModalPreviews(); // Re-renderiza
            }
        });
    }

    // --- (MODIFICAÇÃO 1, 8) Envio do Formulário "Adicionar" com Loader ---
    if (addForm) {
        addForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            // (MODIFICAÇÃO 8) Seleciona o botão e seus spans
            const submitButton = document.getElementById('add-moto-submit-btn');
            const btnText = submitButton ? submitButton.querySelector('.btn-text') : null;
            const btnLoader = submitButton ? submitButton.querySelector('.btn-loader') : null;

            // (MODIFICAÇÃO 8) Ativa o modo "Carregando"
            if (submitButton) submitButton.disabled = true;
            if (btnText) btnText.style.display = 'none';
            if (btnLoader) btnLoader.style.display = 'inline-flex';

            // (MODIFICAÇÃO 1) Lógica de FormData
            const formData = new FormData();
            const formElements = event.target.elements;
            for (const element of formElements) {
                if (element.name && element.type !== 'file') {
                    formData.append(element.name, element.value);
                }
            }

            if (addModalFiles.length === 0) {
                showNotificationModal('Você deve adicionar pelo menos uma imagem.', true);
                // (MODIFICAÇÃO 8) Reverte o botão
                if (submitButton) submitButton.disabled = false;
                if (btnText) btnText.style.display = 'inline-block';
                if (btnLoader) btnLoader.style.display = 'none';
                return; 
            }
            
            addModalFiles.forEach((file) => {
                formData.append('imagens', file, file.name);
            });
            // --- Fim da lógica de FormData ---

            try {
                const response = await fetch('/api/motos', {
                    method: 'POST',
                    body: formData,
                });

                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'Erro ao cadastrar moto.');

                showNotificationModal('Moto cadastrada com sucesso!');
                closeAddModal();

                // Recarrega a lista ou o dashboard
                const estoqueLink = document.querySelector('.nav-link[data-target="estoque-admin"]');
                if (document.getElementById('moto-list-body') && estoqueLink && estoqueLink.classList.contains('active')) {
                    fetchAndRenderMotos('/api/motos');
                }
                if (document.getElementById('stats-total-motos')) {
                    fetchDashboardData();
                }

            } catch (error) {
                console.error('Falha na requisição:', error);
                showNotificationModal(error.message || 'Erro ao cadastrar', true);
            } finally {
                // (MODIFICAÇÃO 8) Garante que o botão volte ao normal
                if (submitButton) submitButton.disabled = false;
                if (btnText) btnText.style.display = 'inline-block';
                if (btnLoader) btnLoader.style.display = 'none';
            }
        });
    }

    // ==============================================
    // 10. MODAL DE VENDA (VENDER MOTO)
    // ==============================================

    function openSellModal(motoId) {
        if (sellMotoIdInput) sellMotoIdInput.value = motoId;
        if (sellModalOverlay) sellModalOverlay.classList.add('is-visible');
    }

    function closeSellModal() {
        if (sellModalOverlay) sellModalOverlay.classList.remove('is-visible');
        if (sellMotoIdInput) sellMotoIdInput.value = '';
    }

    async function handleSellConfirm() {
        const motoId = sellMotoIdInput ? sellMotoIdInput.value : null;
        if (!motoId) return;

        try {
            const response = await fetch(`/api/motos/${motoId}/vender`, {
                method: 'PUT'
            });
            if (!response.ok) throw new Error('Falha ao marcar como vendida.');

            showNotificationModal('Moto vendida com sucesso!');
            closeSellModal();
            fetchAndRenderMotos('/api/motos'); // Recarrega a lista de estoque

        } catch (error) {
            console.error('Erro ao vender moto:', error);
            showNotificationModal(error.message || 'Erro ao vender', true);
        }
    }

    // --- Listeners do Modal Vender ---
    if (btnFecharModalSell) btnFecharModalSell.addEventListener('click', closeSellModal);
    if (sellModalOverlay) {
        sellModalOverlay.addEventListener('click', (e) => {
            if (e.target === sellModalOverlay) closeSellModal();
        });
    }
    if (btnConfirmarModalSell) btnConfirmarModalSell.addEventListener('click', handleSellConfirm);

    // ==============================================
    // 11. MODAL DE EXCLUSÃO PERMANENTE
    // ==============================================

    function openDeletePermanentModal(motoId) {
        if (deletePermanentMotoIdInput) deletePermanentMotoIdInput.value = motoId;
        if (deletePermanentModalOverlay) deletePermanentModalOverlay.classList.add('is-visible');
    }

    function closeDeletePermanentModal() {
        if (deletePermanentModalOverlay) deletePermanentModalOverlay.classList.remove('is-visible');
        if (deletePermanentMotoIdInput) deletePermanentMotoIdInput.value = '';
    }

    // --- Listeners do Modal Excluir Permanente ---
    if (btnFecharModalDeletePermanent) btnFecharModalDeletePermanent.addEventListener('click', closeDeletePermanentModal);
    if (deletePermanentModalOverlay) {
        deletePermanentModalOverlay.addEventListener('click', (e) => {
            if (e.target === deletePermanentModalOverlay) closeDeletePermanentModal();
        });
    }

    // --- LISTENER DO BOTÃO DE CONFIRMAÇÃO ---
    if (btnConfirmarModalDeletePermanent) {
        btnConfirmarModalDeletePermanent.addEventListener('click', async () => {
            const motoId = deletePermanentMotoIdInput ? deletePermanentMotoIdInput.value : null;
            if (!motoId) return;

            try {
                const response = await fetch(`/api/motos/${motoId}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Falha ao excluir a moto.');

                showNotificationModal('Moto excluída permanentemente!');
                closeDeletePermanentModal();

                fetchAndRenderMotos('/api/motos/vendidos'); // Recarrega a lista de VENDIDOS

            } catch (error) {
                console.error('Erro ao deletar permanente:', error);
                showNotificationModal(error.message || 'Erro ao excluir permanentemente', true);
            }
        });
    }

    // ==========================================================
    // (MODIFICAÇÃO 9) NOVA FUNÇÃO - CARREGAR FINANCIAMENTOS
    // ==========================================================
    async function fetchAndRenderFinanciamentos() {
        const listBody = document.getElementById('financiamentos-list-body');
        if (!listBody) return;

        listBody.innerHTML = '<div class="list-empty-message">Carregando propostas...</div>';
        try {
            const response = await fetch('/api/financiamentos');
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Erro ao buscar propostas');

            const propostas = result.data || [];
            listBody.innerHTML = '';

            if (propostas.length === 0) {
                listBody.innerHTML = '<div class="list-empty-message">Nenhuma proposta de financiamento encontrada.</div>';
                return;
            }

            propostas.forEach(prop => {
                const valorMoto = parseFloat(prop.valor_moto || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                const valorEntrada = parseFloat(prop.valor_entrada || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                const valorParcela = parseFloat(prop.valor_parcela_simulada || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                    
                // (MODIFICAÇÃO 11) Lógica do Botão WhatsApp
                // Limpa o telefone para conter apenas dígitos (Ex: (19) 98888-7777 -> 19988887777)
                const telefoneLimpo = prop.telefone.replace(/\D/g, '');
                // Adiciona o código do Brasil (55)
                const telefoneZap = '55' + telefoneLimpo;
                // Cria a mensagem padrão (codificada para URL)
                const mensagemZap = encodeURIComponent(`Olá ${prop.nome}, vi sua proposta de financiamento no site da mybMotos. Vamos conversar?`);
                const urlWhatsapp = `https://wa.me/${telefoneZap}?text=${mensagemZap}`;
                    
                // (MODIFICAÇÃO 10 e 11) Card da Proposta
                const propostaCard = `
                    <article class="financiamento-list-item" data-id="${prop.id}">
                        
                        <div class="fin-col-cliente">
                            <span class="fin-label">Cliente</span>
                            <span class="fin-cliente-nome">${prop.nome}</span>
                            <span class="fin-cliente-contato">${prop.email}</span>
                            <span class="fin-cliente-contato">${prop.telefone}</span>
                                
                            <a href="${urlWhatsapp}" class="btn-action-text btn-whatsapp-proposta" target="_blank">
                                <i class="fa-brands fa-whatsapp"></i> Chamar Cliente
                            </a>
                        </div>
                        
                        <div class="fin-col-simulacao">
                            <span class="fin-label">Simulação</span>
                            <div><strong>Valor Moto:</strong> ${valorMoto}</div>
                            <div><strong>Entrada:</strong> ${valorEntrada}</div>
                            <div><strong>Parcelas:</strong> ${prop.num_parcelas}x de ${valorParcela}</div>
                        </div>
                        
                        <div class="fin-col-meta">
                            <span class="fin-data">${prop.data_formatada}</span>
                            <button class="btn-action-icon btn-delete-financiamento" title="Excluir Proposta">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    
                    </article>
                `;
                listBody.innerHTML += propostaCard;
            });

        } catch (error) {
            console.error('Erro ao popular lista de financiamentos:', error);
            listBody.innerHTML = '<div class="list-empty-message">Erro ao carregar as propostas.</div>';
        }
    }

}); // --- FIM TOTAL DO ARQUIVO (DOMContentLoaded) ---