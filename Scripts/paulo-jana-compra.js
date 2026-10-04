// Navegação por áreas e checkout demonstrativo recuperados do LEVE.
(() => {
    'use strict';
    const home = document.getElementById('conteudo');
    const details = document.getElementById('areaPerfilProduto');
    if (!details) return;
    const catalog = window.PauloJanaCatalog;
    const assets = document.body.dataset.assets;
    const productDialog = document.getElementById('product-dialog');
    const photoDialog = document.getElementById('photo-dialog');
    const checkout = document.getElementById('offcanvasCheckout');
    const form = document.getElementById('checkout-form');
    const status = document.getElementById('checkout-status');
    const originalTitle = document.title;
    const isShop = Boolean(document.getElementById('shop-grid'));
    const catalogAnchor = isShop ? '#catalogo' : '#colecao';
    const fullName = product => product.fullName || 'Anthurium ' + product.name;
    document.querySelectorAll('[data-back-catalog]').forEach(link => {
        link.href = catalogAnchor;
        link.textContent = link.classList.contains('text-link') ? (isShop ? '← Voltar à loja' : '← Voltar à coleção') : (isShop ? 'Loja' : 'Coleção');
    });
    let currentPlant = null;
    const text = (id, value) => { document.getElementById(id).textContent = value; };
    function renderDetails(plant) {
        currentPlant = plant;
        text('detail-title', plant.name);
        text('detail-breadcrumb-name', plant.name);
        text('detail-label', plant.label);
        text('detail-description', plant.description);
        text('detail-species', fullName(plant));
        text('detail-genus', plant.genus || 'Anthurium');
        text('detail-spec-label', plant.specLabel || 'Espécie');
        text('detail-shape-label', plant.shapeLabel || 'Folhagem');
        text('detail-texture-label', plant.textureLabel || 'Textura');
        text('related-title', isShop ? 'Outros produtos para descobrir.' : 'Outros antúrios da coleção.');
        text('detail-shape', plant.shape);
        text('detail-texture', plant.texture);
        const mainImage = document.getElementById('imgPrincipal');
        mainImage.src = assets + plant.image;
        mainImage.alt = fullName(plant) + ' — fotografia de referência';
        const thumbs = document.getElementById('detail-thumbnails');
        thumbs.replaceChildren();
        [plant.image, plant.detail].filter(Boolean).forEach((file, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.setAttribute('aria-label', index ? 'Outra fotografia da espécie' : 'Fotografia principal');
            button.setAttribute('aria-pressed', String(index === 0));
            button.classList.toggle('active', index === 0);
            const img = document.createElement('img'); img.src = assets + file; img.alt = '';
            button.append(img);
            button.addEventListener('click', () => {
                mainImage.src = img.src;
                thumbs.querySelectorAll('button').forEach(item => {
                    item.classList.toggle('active', item === button);
                    item.setAttribute('aria-pressed', String(item === button));
                });
            });
            thumbs.append(button);
        });
        const related = document.getElementById('detail-related');
        related.replaceChildren();
        catalog.filter(item => item.id !== plant.id).sort((a, b) => Number(b.shopCategory === plant.shopCategory) - Number(a.shopCategory === plant.shopCategory)).slice(0, 5).forEach(item => {
            const link = document.createElement('a'); link.href = '#produto/' + item.id; link.className = 'related-card';
            const img = document.createElement('img'); img.src = assets + item.image; img.alt = fullName(item); img.loading = 'lazy';
            const name = document.createElement('h3'); name.textContent = item.name;
            const value = document.createElement('p'); value.textContent = 'Valor sob consulta';
            link.append(img, name, value); related.append(link);
        });
        document.title = fullName(plant) + ' | Paulo & Jana — Plantas';
    }
    function navigate() {
        const match = /^#produto\/([a-z0-9-]+)$/.exec(location.hash);
        const plant = match && catalog.find(item => item.id === match[1]);
        if (productDialog && productDialog.open) productDialog.close();
        if (photoDialog.open) photoDialog.close();
        if (checkout.open) checkout.close();
        document.body.classList.remove('dialog-open');
        home.hidden = Boolean(plant); details.hidden = !plant;
        if (plant) {
            renderDetails(plant);
            window.scrollTo({ top: 0, behavior: 'instant' });
            document.getElementById('detail-title').focus({ preventScroll: true });
        } else {
            currentPlant = null; document.title = originalTitle;
            // Home anchors need a second scroll after unhiding the original area.
            const anchor = location.hash.slice(1);
            const section = anchor && document.getElementById(anchor);
            if (section) section.scrollIntoView({ behavior: 'instant' });
        }
    }
    document.getElementById('detail-zoom').addEventListener('click', () => {
        const source = document.getElementById('imgPrincipal');
        const zoom = document.getElementById('zoom-image'); zoom.src = source.src; zoom.alt = source.alt;
        photoDialog.showModal(); document.body.classList.add('dialog-open');
    });
    if (!productDialog) {
        photoDialog.querySelector('[data-close]').addEventListener('click', () => photoDialog.close());
        photoDialog.addEventListener('close', () => document.body.classList.remove('dialog-open'));
    }
    function abrirCheckout() {
        if (!currentPlant) return;
        form.reset(); form.hidden = false; status.hidden = true;
        text('checkout-nome', currentPlant.name);
        text('checkout-genus', currentPlant.genus || 'Anthurium');
        text('checkout-preco', 'Valor sob consulta');
        const image = document.getElementById('checkout-img'); image.src = assets + currentPlant.image; image.alt = fullName(currentPlant);
        checkout.showModal(); checkout.scrollTop = 0; document.body.classList.add('dialog-open');
    }
    document.getElementById('comprar-agora').addEventListener('click', abrirCheckout);
    checkout.querySelector('[data-checkout-close]').addEventListener('click', () => checkout.close());
    document.getElementById('btnFecharCheckout').addEventListener('click', () => checkout.close());
    checkout.addEventListener('close', () => { form.reset(); form.hidden = false; status.hidden = true; document.body.classList.remove('dialog-open'); });
    checkout.addEventListener('click', event => {
        const rect = checkout.getBoundingClientRect();
        if (event.target === checkout && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) checkout.close();
    });
    form.addEventListener('submit', event => {
        event.preventDefault();
        if (!form.reportValidity() || !currentPlant) return;
        const payment = form.elements.pagamento.value;
        text('checkout-result', 'Você percorreu a compra de ' + fullName(currentPlant) + ' com a opção ' + payment + '.');
        form.hidden = true; status.hidden = false;
        status.querySelector('h3').focus();
    });
    window.addEventListener('hashchange', navigate);
    navigate();
})();
