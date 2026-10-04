(() => {
    'use strict';
    const grid = document.getElementById('shop-grid');
    if (!grid) return;
    const products = window.PauloJanaShopCatalog;
    const categories = window.PauloJanaShopCategories;
    window.PauloJanaCatalog = products;
    const search = document.getElementById('shop-search');
    const sort = document.getElementById('shop-sort');
    const kinds = [...document.querySelectorAll('input[name="shop-kind"]')];
    const cards = new Map([...grid.children].map(card => [card.dataset.shopProduct, card]));
    const categoryButtons = [...document.querySelectorAll('[data-shop-category]')];
    const toggle = document.getElementById('shop-filter-toggle');
    const sidebar = document.getElementById('shop-sidebar');
    const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    let category = 'todas';
    const navLink = document.getElementById('nav-shop');
    if (navLink) navLink.setAttribute('aria-current', 'page');

    function render(updateUrl = true) {
        const query = normalize(search.value.trim());
        const selectedKinds = kinds.filter(input => input.checked).map(input => input.value);
        const filtered = products.filter(product => {
            const categoryName = categories.find(item => item.id === product.shopCategory).name;
            const haystack = normalize([product.name, product.fullName, product.genus, product.label, categoryName].join(' '));
            return (category === 'todas' || product.shopCategory === category) && selectedKinds.includes(product.kind) && query.split(/\s+/).every(word => haystack.includes(word));
        });
        if (sort.value !== 'destaques') filtered.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR') * (sort.value === 'za' ? -1 : 1));
        const visible = new Set(filtered.map(product => product.id));
        cards.forEach((card, id) => { card.hidden = !visible.has(id); });
        filtered.forEach(product => grid.appendChild(cards.get(product.id)));
        categoryButtons.forEach(button => {
            const active = button.dataset.shopCategory === category;
            button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active));
        });
        document.getElementById('shop-count').textContent = filtered.length + (filtered.length === 1 ? ' produto' : ' produtos');
        document.getElementById('shop-empty').hidden = filtered.length > 0;
        grid.hidden = !filtered.length;
        const selectedCategory = categories.find(item => item.id === category);
        document.getElementById('shop-category-description').textContent = selectedCategory ? selectedCategory.description : 'Plantas para colecionar. Objetos para cuidar.';
        const summary = [];
        if (selectedCategory) summary.push(selectedCategory.name);
        if (search.value.trim()) summary.push('Busca: ' + search.value.trim());
        if (selectedKinds.length !== 2) summary.push(selectedKinds.length ? (selectedKinds[0] === 'plantas' ? 'Plantas' : 'Vasos e acessórios') : 'Nenhum tipo selecionado');
        document.getElementById('shop-active-filters').hidden = summary.length === 0;
        document.getElementById('shop-filter-summary').textContent = summary.join(' · ');
        if (updateUrl) {
            const url = new URL(location.href);
            for (const key of ['categoria', 'q', 'ordem', 'tipo']) url.searchParams.delete(key);
            if (category !== 'todas') url.searchParams.set('categoria', category);
            if (search.value.trim()) url.searchParams.set('q', search.value.trim());
            if (sort.value !== 'destaques') url.searchParams.set('ordem', sort.value);
            if (selectedKinds.length !== 2) url.searchParams.set('tipo', selectedKinds[0] || 'nenhum');
            history.replaceState(null, '', url);
        }
    }
    function readState() {
        const params = new URLSearchParams(location.search);
        category = categories.some(item => item.id === params.get('categoria')) ? params.get('categoria') : 'todas';
        search.value = params.get('q') || '';
        sort.value = ['az', 'za'].includes(params.get('ordem')) ? params.get('ordem') : 'destaques';
        const type = params.get('tipo');
        kinds.forEach(input => { input.checked = !['plantas', 'acessorios', 'nenhum'].includes(type) || type === input.value; });
        render(false);
    }
    function closeFilters() { sidebar.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
    toggle.addEventListener('click', () => {
        const open = toggle.getAttribute('aria-expanded') !== 'true';
        toggle.setAttribute('aria-expanded', String(open)); sidebar.classList.toggle('open', open);
    });
    categoryButtons.forEach(button => button.addEventListener('click', () => {
        category = button.dataset.shopCategory; render(); closeFilters();
        if (button.classList.contains('category-tile')) document.getElementById('catalogo').scrollIntoView({ behavior: 'smooth' });
    }));
    search.addEventListener('input', () => render());
    sort.addEventListener('change', () => render());
    kinds.forEach(input => input.addEventListener('change', () => render()));
    document.querySelectorAll('[data-shop-reset]').forEach(button => button.addEventListener('click', () => {
        category = 'todas'; search.value = ''; sort.value = 'destaques'; kinds.forEach(input => { input.checked = true; }); render();
    }));
    window.addEventListener('popstate', readState);
    readState();
})();
