(() => {
  const input = document.querySelector('#search');
  if (!input) return;
  const results = document.querySelector('#search-results');
  let index;
  let revision = 0;
  input.addEventListener('input', async () => {
    const token = ++revision;
    const query = input.value.trim().toLowerCase();
    results.replaceChildren();
    results.hidden = !query;
    if (!query) return;
    try {
      index ||= fetch(document.body.dataset.searchIndex).then(r => {
        if (!r.ok) throw new Error('Index unavailable');
        return r.json();
      }).catch(e => { index = undefined; throw e; });
      const pages = await index;
      if (token !== revision) return;
      const terms = query.split(/\s+/);
      const matches = pages.filter(p => terms.every(t => (p.title+' '+p.text).toLowerCase().includes(t)))
        .sort((a,b) => Number(b.title.toLowerCase().includes(query))-Number(a.title.toLowerCase().includes(query))).slice(0,7);
      if (!matches.length) {
        const p = document.createElement('p');p.textContent='No matching pages. Try a shorter phrase.';results.append(p);
      }
      for (const page of matches) {
        const a=document.createElement('a');a.href=page.url;
        const title=document.createElement('strong');title.textContent=page.title;
        const excerpt=document.createElement('span');
        const at=Math.max(0,page.text.toLowerCase().indexOf(terms[0])-40);
        excerpt.textContent=(at?'…':'')+page.text.slice(at,at+155)+'…';
        a.append(title,excerpt);results.append(a);
      }
    } catch (_) {
      if (token!==revision) return;
      results.textContent='Search is unavailable. Use the page navigation instead.';
    }
  });
  document.addEventListener('keydown', e => {
    if(e.key==='Escape' && !results.hidden){revision++;results.hidden=true;input.value='';input.focus();}
  });
})();
