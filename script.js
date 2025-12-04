// script.js
const EL = {
    list: document.getElementById('companies-list'),
    search: document.getElementById('search'),
    city: document.getElementById('filter-city'),
    category: document.getElementById('filter-category'),
    listSection: document.getElementById('list-section'),
    companySection: document.getElementById('company-section'),
    companyDetail: document.getElementById('company-detail'),
    backLink: document.getElementById('back-link'),
    year: document.getElementById('year')
  };
  EL.year.textContent = new Date().getFullYear();
  
  let companies = [];
  
  async function loadData(){
    const res = await fetch('./companies.json');
    companies = await res.json();
    initFilters();
    renderList(companies);
    handleHashChange();
  }
  
  function initFilters(){
    const cities = Array.from(new Set(companies.map(c=>c.city))).sort();
    const cats = Array.from(new Set(companies.map(c=>c.category))).sort();
    cities.forEach(city => {
      const o = document.createElement('option'); o.value = city; o.textContent = city; EL.city.appendChild(o);
    });
    cats.forEach(cat => {
      const o = document.createElement('option'); o.value = cat; o.textContent = capitalize(cat); EL.category.appendChild(o);
    });
  
    EL.search.addEventListener('input', onFilterChange);
    EL.city.addEventListener('change', onFilterChange);
    EL.category.addEventListener('change', onFilterChange);
  }
  
  function onFilterChange(){
    const q = EL.search.value.trim().toLowerCase();
    const city = EL.city.value;
    const cat = EL.category.value;
    const filtered = companies.filter(c => {
      const matchQ = q === '' || [c.name, c.description, c.city, c.category].join(' ').toLowerCase().includes(q);
      const matchCity = city === '' || c.city === city;
      const matchCat = cat === '' || c.category === cat;
      return matchQ && matchCity && matchCat;
    });
    renderList(filtered);
  }
  
  function renderList(list){
    EL.list.innerHTML = list.length ? list.map(renderListItem).join('') : '<li>Aucune fiche trouvée</li>';
  }
  
  function renderListItem(c){
    return `<li>
      <a href="#company=${encodeURIComponent(c.slug)}">${escapeHtml(c.name)}</a>
      <div class="muted">${escapeHtml(c.city)} — ${escapeHtml(c.category)}</div>
      <p>${escapeHtml(shorten(c.description,200))}</p>
    </li>`;
  }
  
  function renderCompany(slug){
    const c = companies.find(x => x.slug === slug);
    if(!c){ EL.companyDetail.innerHTML = '<p>Fiche introuvable</p>'; return; }
    EL.companyDetail.innerHTML = `
      <h1>${escapeHtml(c.name)}</h1>
      <p><strong>Catégorie :</strong> ${escapeHtml(c.category)} — <strong>Ville :</strong> ${escapeHtml(c.city)}</p>
      <p><strong>Adresse :</strong> ${escapeHtml(c.address || '—')}</p>
      <p><strong>Téléphone :</strong> <a href="tel:${escapeHtml(c.phone)}">${escapeHtml(c.phone)}</a></p>
      <p><strong>Horaires :</strong> ${escapeHtml(c.hours || '—')}</p>
      <article><h2>Présentation</h2><p>${escapeHtml(c.description)}</p></article>
      <p><small>Fiche vérifiée : ${escapeHtml(c.verified_at || '—')}</small></p>
    `;
  }
  
  function handleHashChange(){
    const hash = location.hash || '';
    if(hash.startsWith('#company=')){
      const slug = decodeURIComponent(hash.split('=')[1]);
      EL.listSection.classList.add('hidden');
      EL.companySection.classList.remove('hidden');
      renderCompany(slug);
      window.scrollTo(0,0);
    } else {
      EL.companySection.classList.add('hidden');
      EL.listSection.classList.remove('hidden');
    }
  }
  
  window.addEventListener('hashchange', handleHashChange);
  EL.backLink.addEventListener('click', e => { e.preventDefault(); location.hash=''; });
  
  function escapeHtml(s){ if(!s) return ''; return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
  function shorten(s,n){ return s.length>n? s.slice(0,n-1)+'…': s; }
  function capitalize(s){ return s.charAt(0).toUpperCase()+s.slice(1); }
  
  loadData().catch(err => {
    EL.list.innerHTML = '<li>Erreur de chargement des données</li>';
    console.error(err);
  });
  