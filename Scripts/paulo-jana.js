(() => {
    'use strict';
    const nav = document.getElementById('site-nav');
    const toggle = document.getElementById('menu-toggle');
    const closeMenu = () => { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Abrir menu'); };
    toggle.addEventListener('click', () => {
        const open = toggle.getAttribute('aria-expanded') !== 'true';
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
        nav.classList.toggle('open', open);
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
    document.querySelectorAll('[data-filter]').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('[data-filter]').forEach(filter => {
                const active = filter === button;
                filter.classList.toggle('active', active);
                filter.setAttribute('aria-pressed', String(active));
            });
            let count = 0;
            document.querySelectorAll('.plant-card').forEach(card => {
                card.hidden = button.dataset.filter !== 'todas' && card.dataset.category !== button.dataset.filter;
                if (!card.hidden) count++;
            });
            document.getElementById('collection-count').textContent = count + (count === 1 ? ' espécie' : ' espécies');
        });
    });
    const dialog = document.getElementById('product-dialog');
    if (!dialog) return;
    const photoDialog = document.getElementById('photo-dialog');
    const image = document.getElementById('product-image');
    const contact = document.getElementById('product-contact');
    const assets = document.body.dataset.assets;
    function syncScroll() { document.body.classList.toggle('dialog-open', dialog.open || photoDialog.open); }
    [dialog, photoDialog].forEach(modal => {
        modal.querySelector('[data-close]').addEventListener('click', () => modal.close());
        modal.addEventListener('close', syncScroll);
        modal.addEventListener('click', event => {
            const box = modal.getBoundingClientRect();
            if (event.target === modal && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) modal.close();
        });
    });
    document.querySelectorAll('[data-product]').forEach(button => button.addEventListener('click', () => {
        const plant = window.PauloJanaCatalog.find(item => item.id === button.dataset.product);
        if (!plant) return;
        document.getElementById('product-title').textContent = plant.name;
        document.getElementById('product-description').textContent = plant.description;
        document.getElementById('product-shape').textContent = plant.shape;
        document.getElementById('product-texture').textContent = plant.texture;
        image.src = assets + plant.image;
        image.alt = 'Anthurium ' + plant.name + ' — fotografia de referência';
        const thumbnails = document.getElementById('product-thumbnails');
        thumbnails.replaceChildren();
        [plant.image, plant.detail].filter(Boolean).forEach((file, index) => {
            const thumb = document.createElement('button');
            thumb.type = 'button';
            thumb.setAttribute('aria-label', index === 0 ? 'Ver fotografia principal' : 'Ver outra fotografia da espécie');
            thumb.setAttribute('aria-pressed', String(index === 0));
            thumb.classList.toggle('active', index === 0);
            const picture = document.createElement('img');
            picture.src = assets + file; picture.alt = '';
            thumb.appendChild(picture);
            thumb.addEventListener('click', () => {
                image.src = picture.src;
                thumbnails.querySelectorAll('button').forEach(other => {
                    other.classList.toggle('active', other === thumb);
                    other.setAttribute('aria-pressed', String(other === thumb));
                });
            });
            thumbnails.appendChild(thumb);
        });
        contact.href = '#produto/' + plant.id;
        contact.removeAttribute('target'); contact.removeAttribute('rel');
        dialog.showModal(); dialog.scrollTop = 0; syncScroll();
    }));
    contact.addEventListener('click', () => dialog.close());
    document.getElementById('zoom-product').addEventListener('click', () => {
        const zoom = document.getElementById('zoom-image'); zoom.src = image.src; zoom.alt = image.alt;
        photoDialog.showModal(); syncScroll();
    });
})();
