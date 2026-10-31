/* Presentation enhancements only; API, auth and business rules stay in their modules. */
(() => {
  'use strict';
  const paths = {
    home:'M3 10 12 3l9 7v10H3V10Zm6 10v-7h6v7',
    semana:'m4 10 2-6h12l2 6M3 10h18v8H3v-8Zm3 8v3m12-3v3M6 14h2m8 0h2',
    ordens:'M8 5H5v16h14V5h-3M8 3h8v5H8V3Zm0 10h8m-8 4h5',
    pecas:'m3 7 9-4 9 4-9 4-9-4Zm0 0v10l9 4 9-4V7M12 11v10M7 5l10 4',
    orcamentos:'M5 3h10l4 4v14H5V3Zm9 0v5h5M8 12h8m-8 4h5',
    pagamentos:'M3 6h18v14H3V6Zm0 4h18M6 16h4'
  };
  const icon = key => `<svg class="rv-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[key] || paths.home}"/></svg>`;
  const hrefKeys = {'/':'home','/semana.html':'semana','/ordens-servico.html':'ordens','/pecas-pedir.html':'pecas','/orcamentos.html':'orcamentos','/pagamentos.html':'pagamentos'};
  document.querySelectorAll('.app-links a').forEach(link => link.insertAdjacentHTML('afterbegin',icon(hrefKeys[link.getAttribute('href')])));
  document.querySelectorAll('.workbench-tile').forEach(link => link.insertAdjacentHTML('afterbegin',`<span class="tile-icon">${icon(hrefKeys[link.getAttribute('href')])}</span>`));

  const main = document.querySelector('main');
  if (main && document.body.dataset.page !== 'login') {
    if (!main.id) main.id = 'conteudo';
    main.tabIndex = -1;
    const skip = document.createElement('a');
    skip.className = 'skip-link'; skip.href = `#${main.id}`; skip.textContent = 'Ir para o conteúdo';
    document.body.prepend(skip);
  }
  const dashboard = document.querySelector('.workbench-head');
  if (dashboard) {
    dashboard.querySelector('p').textContent = 'Acompanhe a operação e continue de onde parou.';
    const action = document.createElement('a');
    action.className='dashboard-cta'; action.href='/orcamentos.html'; action.innerHTML=icon('orcamentos')+'Novo orçamento';
    dashboard.append(action);
  }

  // Moving the original archive preserves all handlers and data already attached to it.
  const archive = document.querySelector('body[data-page="orcamentos"] .orders-archive');
  if (archive) {
    const dialog = document.createElement('dialog');
    dialog.id='budget-library'; dialog.className='budget-library'; dialog.setAttribute('aria-labelledby','budget-library-title');
    const title = archive.querySelector('h2');
    title.id='budget-library-title'; title.textContent='Todos os orçamentos';
    title.parentElement.classList.add('archive-title-group');
    dialog.append(archive); document.body.append(dialog);
    const close = document.createElement('button');
    close.type='button'; close.className='dialog-close'; close.setAttribute('aria-label','Fechar orçamentos'); close.textContent='×';
    archive.querySelector('.archive-heading').append(close);
    const actions = document.createElement('div'); actions.className='page-header-actions';
    const open = document.createElement('button'); open.type='button'; open.id='open-budget-library';
    open.setAttribute('aria-haspopup','dialog'); open.setAttribute('aria-controls',dialog.id);
    open.innerHTML=icon('orcamentos')+'Ver orçamentos'; actions.append(open);
    document.querySelector('.orders-header').append(actions);
    open.addEventListener('click',()=>{dialog.showModal();document.getElementById('budget-search').focus();});
    close.addEventListener('click',()=>dialog.close());
    // Close before edit moves focus to the existing editor. Conversion/delete open nested dialogs.
    let editing=false;
    dialog.addEventListener('click',event=>{if(event.target.closest('[data-budget-edit]')) {editing=true;dialog.close();}},true);
    dialog.addEventListener('close',()=>{
      const target=editing ? document.getElementById('budget-form-title') : open;
      if(editing)target.tabIndex=-1;
      target.focus({preventScroll:true}); editing=false;
    });
    document.getElementById('budget-search').setAttribute('aria-label','Pesquisar orçamentos');
    document.getElementById('budget-search-field').setAttribute('aria-label','Campo da pesquisa de orçamentos');
  }

  // Existing search inputs and icon-only close controls receive accessible names.
  document.querySelectorAll('input[type="search"], .quick-grid input').forEach(input=>{
    if (!input.labels?.length && !input.hasAttribute('aria-label')) input.setAttribute('aria-label',input.placeholder || 'Pesquisar');
  });
  const status=document.getElementById('budget-status');
  if(status){status.setAttribute('role','status');status.setAttribute('aria-live','polite');}
  document.querySelectorAll('dialog').forEach(dialog=>{
    const heading=dialog.querySelector('h2');
    if(heading && !dialog.hasAttribute('aria-labelledby')) {
      if(!heading.id) heading.id=dialog.id+'-title';
      dialog.setAttribute('aria-labelledby',heading.id);
    }
    dialog.querySelectorAll('button').forEach(button=>{
      if(button.textContent.trim()==='×' && !button.hasAttribute('aria-label')) button.setAttribute('aria-label','Fechar');
    });
  });
  document.addEventListener('keydown',event=>{
    if(event.key!=='Escape')return;
    const expanded=document.querySelector('.client-select-toggle[aria-expanded="true"]');
    if(expanded) {
      event.preventDefault();
      expanded.setAttribute('aria-expanded','false');
      expanded.closest('.field').querySelector('.client-select-panel').hidden=true;
      expanded.focus();
    }
  });
})();
