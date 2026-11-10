(function(){
var WA='2348029743214';
var MAPS='https://www.google.com/maps/search/?api=1&query=ASA+Bar+and+Kitchen+26+Osuntokun+Avenue+Old+Bodija+Ibadan';

var DEFAULTS=[
  {id:1, name:'Grilled Fish', price:6500, cats:['food','specials'], img:'menu_grilled_fish.jpg', desc:'Freshly prepared whole fish with signature yaji seasoning and lime.'},
  {id:2, name:'Signature Mojito', price:4000, cats:['cocktails','drinks'], img:'menu_signature_mojito.jpg', desc:'Craft botanical mix with fresh crushed mint, lime juice, and soda.'},
  {id:3, name:'Suya Platter', price:5500, cats:['food','specials'], img:'menu_suya_platter.jpg', desc:'Tender charred skewers with sliced red onions and native pepper rub.'},
  {id:4, name:'Classic Margarita', price:4500, cats:['cocktails','drinks'], img:'menu_classic_margarita.jpg', desc:'Crisp tequila blend with triple sec, fresh lime, and sea salt rim.'},
  {id:5, name:'Firewood Jollof & Asun', price:9500, cats:['food'], img:'menu_jollof_rice.jpg', desc:'Smoky party jollof rice served with peppered goat meat and sweet dodo.'},
  {id:6, name:'VIP Bottle & Shisha Suite', price:165000, cats:['vip','drinks'], img:'craft_cocktails.jpg', desc:'Hennessy VSOP bottle service with ice shisha and dedicated sparklers.'}
];

var TABS=[
  ['all','All Offerings'],
  ['food','Food'],
  ['drinks','Drinks'],
  ['cocktails','Cocktails'],
  ['specials','Specials'],
  ['vip','VIP Bottle & Shisha']
];

var $=function(s,r){return(r||document).querySelector(s)}, $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var naira=function(n){return '₦'+Number(n).toLocaleString('en-NG')};
var wa=function(t){return 'https://wa.me/'+WA+'?text='+encodeURIComponent(t)};
var imgBase=(window.ASA_IMG||function(n){return 'assets/'+n});

function load(){
  try{
    var raw=localStorage.getItem('asa_full_menu');
    if(raw){
      var parsed=JSON.parse(raw);
      if(Array.isArray(parsed)&&parsed.length>0)return parsed;
    }
    var s=JSON.parse(localStorage.getItem('asa_menu'));
    if(s)return DEFAULTS.map(function(d){var o=s[d.id]||{};return Object.assign({},d,{price:o.price||d.price,out:!!o.out})});
  }catch(e){}
  return DEFAULTS.map(function(d){return Object.assign({},d,{out:false})});
}

var items=load(), cart={}, tab='all';

function save(){
  try{
    localStorage.setItem('asa_full_menu',JSON.stringify(items));
    var o={};
    items.forEach(function(i){o[i.id]={price:i.price,out:i.out}});
    localStorage.setItem('asa_menu',JSON.stringify(o));
  }catch(e){}
}

/* ---------- menu ---------- */
function renderMenu(){
  var m=$('#menu-grid');
  if(!m)return;
  var tabsEl=$('#tabs');
  if(tabsEl){
    tabsEl.innerHTML=TABS.map(function(t){
      return '<button class="tab" role="tab" data-t="'+t[0]+'" aria-selected="'+(t[0]===tab)+'">'+t[1]+'</button>';
    }).join('');
  }

  var filtered=items.filter(function(i){
    return tab==='all'||(i.cats&&i.cats.indexOf(tab)>-1);
  });

  if(!filtered.length){
    m.innerHTML='<div style="grid-column:1/-1; text-align:center; padding:40px 20px; color:var(--taupe);">' +
      '<p style="font-size:1.1rem; color:var(--ivory); margin-bottom:8px;">No offerings currently listed in this category.</p>' +
      '<p style="font-size:0.85rem;">Check back shortly or explore our full selection.</p>' +
    '</div>';
    return;
  }

  m.innerHTML=filtered.map(function(i){
    return '<article class="item'+(i.out?' out':'')+'">' +
      '<div class="ph"><img loading="lazy" alt="'+i.name+'" src="'+imgBase(i.img)+'"></div>' +
      '<div class="bd">' +
        '<h3>'+i.name+'</h3>' +
        '<p style="font-size:0.8rem; color:var(--taupe); line-height:1.4;">'+(i.desc||'Signature preparation prepared fresh at ASA Bar & Kitchen.')+'</p>' +
        '<div class="row">' +
          '<span class="pr">'+naira(i.price)+'</span>' +
          (i.out ? '<span class="tag">Sold out today</span>' : '<button class="btn gold sm" data-add="'+i.id+'">Order Now &rarr;</button>') +
        '</div>' +
      '</div>' +
    '</article>';
  }).join('');
}

document.addEventListener('click',function(e){
  var t=e.target.closest('[data-t]');
  if(t){tab=t.dataset.t;renderMenu();}

  var a=e.target.closest('[data-add]');
  if(a){cart[a.dataset.add]=(cart[a.dataset.add]||0)+1;renderCart();}

  var q=e.target.closest('[data-q]');
  if(q){
    var id=q.dataset.id;
    cart[id]=(cart[id]||0)+Number(q.dataset.q);
    if(cart[id]<=0)delete cart[id];
    renderCart();
  }

  var s=e.target.closest('[data-staff]');
  if(s){
    e.preventDefault();
    openStaff();
  }

  var del=e.target.closest('[data-del]');
  if(del){
    var did=del.dataset.del;
    items=items.filter(function(i){return String(i.id)!==String(did)});
    delete cart[did];
    save();
    renderMenu();
    renderCart();
    drawEditor();
    var sm=$('#save-msg');
    if(sm) sm.textContent='✓ Item deleted from live menu!';
  }
});

/* ---------- cart ---------- */
function cartInfo(){
  var n=0,tot=0,lines=[];
  items.forEach(function(i){
    var q=cart[i.id];
    if(q&&!i.out){n+=q;tot+=q*i.price;lines.push({i:i,q:q});}
  });
  return{n:n,tot:tot,lines:lines};
}

function renderCart(){
  var c=$('#cart');
  if(!c)return;
  var k=cartInfo();
  c.classList.toggle('show',k.n>0);
  if(!k.n)c.classList.remove('open');

  var cl=$('#cart-list');
  if(cl){
    cl.innerHTML=k.lines.map(function(l){
      return '<div class="ci"><span>'+l.i.name+'<br><small style="color:var(--taupe)">'+naira(l.i.price)+' each</small></span><span class="qty"><button aria-label="Remove one" data-q="-1" data-id="'+l.i.id+'">&minus;</button>'+l.q+'<button aria-label="Add one" data-q="1" data-id="'+l.i.id+'">+</button></span></div>';
    }).join('');
  }

  var b=$('#cart-go');
  if(b){
    b.textContent=k.n+' Item'+(k.n>1?'s':'')+' • '+naira(k.tot)+' — Order via WhatsApp';
    var orderLines = k.lines.map(function(l){
      return '• ' + l.q + 'x ' + l.i.name + ' (' + naira(l.q*l.i.price) + ')';
    });
    var lines = [
      '━━━━━━━━━━━━━━━━━━━━',
      '🍽️ *ASA BAR & KITCHEN • DIRECT ORDER*',
      '━━━━━━━━━━━━━━━━━━━━',
      ''
    ].concat(orderLines).concat([
      '',
      '💰 *Total Bill:* ' + naira(k.tot),
      '',
      '━━━━━━━━━━━━━━━━━━━━',
      '_Please confirm table number or delivery address._'
    ]);
    b.href=wa(lines.join('\n'));
  }
}

var tg=$('#cart-toggle');
if(tg)tg.onclick=function(){
  var c=$('#cart');
  if(c){
    c.classList.toggle('open');
    tg.setAttribute('aria-expanded',c.classList.contains('open'));
  }
};

/* ---------- staff modal ---------- */
var ov=$('#staff'), lastFocus;
function openStaff(){
  if(!ov) ov=$('#staff');
  if(!ov) return;
  lastFocus=document.activeElement;
  ov.classList.add('show');
  var pv=$('#pin-view'), ev=$('#edit-view');
  if(pv) pv.classList.remove('hide');
  if(ev) ev.classList.add('hide');
  var pin=$('#pin'), err=$('#pin-err');
  if(pin) pin.value='';
  if(err) err.textContent='';
  setTimeout(function(){if(pin) pin.focus()},50);
}
function closeStaff(){
  if(ov) ov.classList.remove('show');
  if(lastFocus)lastFocus.focus();
}

function drawEditor(){
  var el=$('#edit-list');
  if(!el)return;
  if(!items.length){
    el.innerHTML='<p style="color:var(--taupe); font-size:0.85rem; padding:12px 0;">No items currently listed. Add a new dish or bottle below!</p>';
    return;
  }
  el.innerHTML=items.map(function(i){
    var catLabel=(i.cats&&i.cats.length)?i.cats.join(', '):'food';
    return '<div class="srow" style="display:flex; justify-content:space-between; align-items:center; gap:8px; padding:8px 0; border-bottom:1px solid var(--line-subtle);">' +
      '<div style="flex:1; min-width:0;">' +
        '<div style="font-weight:600; font-size:0.85rem; color:var(--ivory); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">'+i.name+'</div>' +
        '<small style="color:var(--taupe); font-size:0.7rem; text-transform:uppercase;">'+catLabel+'</small>' +
      '</div>' +
      '<div style="display:flex; align-items:center; gap:6px;">' +
        '<span style="color:var(--gold); font-size:0.8rem; font-weight:700;">₦</span>' +
        '<input type="number" min="0" step="500" data-p="'+i.id+'" value="'+i.price+'" style="width:75px; text-align:right; font-size:0.8rem; padding:4px 6px;">' +
        '<label style="font-size:0.72rem; display:flex; align-items:center; gap:3px; cursor:pointer; color:var(--taupe); white-space:nowrap;" title="Toggle 86 / Sold Out">' +
          '<input type="checkbox" data-o="'+i.id+'"'+(i.out?' checked':'')+'> 86' +
        '</label>' +
        '<button type="button" class="del-item-btn" data-del="'+i.id+'" style="background:none; border:none; color:#f87171; font-size:1.2rem; cursor:pointer; padding:0 4px; line-height:1;" title="Remove Item">&times;</button>' +
      '</div>' +
    '</div>';
  }).join('');
}

if(ov){
  var sc=$('#staff-close');
  if(sc) sc.onclick=closeStaff;
  ov.addEventListener('click',function(e){if(e.target===ov)closeStaff();});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&ov.classList.contains('show'))closeStaff();});

  var pf=$('#pin-form');
  if(pf){
    pf.onsubmit=function(e){
      e.preventDefault();
      var pinVal=$('#pin')?$('#pin').value:'';
      if(pinVal==='1234'){
        var pv=$('#pin-view'), ev=$('#edit-view');
        if(pv) pv.classList.add('hide');
        if(ev) ev.classList.remove('hide');
        drawEditor();
      }else{
        var pe=$('#pin-err');
        if(pe) pe.textContent='Incorrect PIN. Enter 1234.';
        if($('#pin')) $('#pin').select();
      }
    };
  }

  var sv=$('#save');
  if(sv){
    sv.onclick=function(){
      $$('[data-p]').forEach(function(inp){
        var it=items.filter(function(i){return String(i.id)===String(inp.dataset.p)})[0], v=parseInt(inp.value,10);
        if(!isNaN(v)&&v>=0&&it)it.price=v;
      });
      $$('[data-o]').forEach(function(c){
        var it=items.filter(function(i){return String(i.id)===String(c.dataset.o)})[0];
        if(it) it.out=c.checked;
      });
      save();
      renderMenu();
      renderCart();
      var sm=$('#save-msg');
      if(sm) sm.textContent='✓ Prices & status saved live to menu!';
    };
  }

  var btnAdd=$('#btn-add-item');
  if(btnAdd){
    btnAdd.onclick=function(){
      var nameInp=$('#new-name'), priceInp=$('#new-price'), catSel=$('#new-cat'), descInp=$('#new-desc');
      var name=nameInp?nameInp.value.trim():'';
      var price=priceInp?parseInt(priceInp.value,10):0;
      var cat=catSel?catSel.value:'food';
      var desc=descInp?descInp.value.trim():'';
      var sm=$('#save-msg');

      if(!name){
        if(sm) sm.textContent='Please enter a dish or drink name.';
        if(nameInp) nameInp.focus();
        return;
      }
      if(isNaN(price)||price<=0){
        if(sm) sm.textContent='Please enter a valid price in Naira.';
        if(priceInp) priceInp.focus();
        return;
      }

      var defaultImg='signature_jollof_dish.jpg';
      if(cat==='cocktails'||cat==='drinks') defaultImg='craft_cocktails.jpg';
      else if(cat==='vip') defaultImg='craft_cocktails.jpg';
      else if(cat==='specials') defaultImg='menu_grilled_fish.jpg';

      var newItem={
        id: Date.now(),
        name: name,
        price: price,
        cats: [cat],
        img: defaultImg,
        desc: desc || 'Signature preparation prepared fresh at ASA Bar & Kitchen.',
        out: false
      };

      items.push(newItem);
      save();
      renderMenu();
      renderCart();
      drawEditor();

      if(nameInp) nameInp.value='';
      if(priceInp) priceInp.value='';
      if(descInp) descInp.value='';
      if(sm) sm.textContent='✓ "'+name+'" added and live on menu!';
    };
  }

  var rs=$('#reset');
  if(rs){
    rs.onclick=function(){
      if(confirm('Restore all default dishes and prices?')){
        localStorage.removeItem('asa_full_menu');
        localStorage.removeItem('asa_menu');
        items=DEFAULTS.map(function(d){return Object.assign({},d,{out:false})});
        cart={};
        save();
        drawEditor();
        renderMenu();
        renderCart();
        var sm=$('#save-msg');
        if(sm) sm.textContent='Default menu restored.';
      }
    };
  }
}

/* ---------- reputation ---------- */
var st=$('#stars');
if(st){
  st.innerHTML=[1,2,3,4,5].map(function(n){
    return '<button class="star" data-s="'+n+'" aria-label="'+n+' stars">&starf;</button>';
  }).join('');

  st.onclick=function(e){
    var b=e.target.closest('[data-s]');
    if(!b)return;
    var n=+b.dataset.s;
    $$('.star',st).forEach(function(s){s.classList.toggle('on',+s.dataset.s<=n)});
    var r=$('#res');
    if(!r) return;
    r.className='res show';
    r.innerHTML=n>=4 ?
      '<p>Thank you for dining with us! A review on Google Maps helps other Bodija diners discover ASA.</p><a class="btn gold" target="_blank" rel="noopener" href="'+MAPS+'">Post Review on Google Maps &rarr;</a>' :
      '<p><b>Private Note to General Manager:</b> We hold ourselves to high standards. Tell the manager directly so we can resolve this before you leave.</p><a class="btn" style="border-color:var(--gold); color:var(--gold);" target="_blank" rel="noopener" href="'+wa('Hello, I am at ASA and rated my visit '+n+'/5. Here is what we need fixed: ')+'">Message Manager on WhatsApp &rarr;</a>';
  };
}

renderMenu();
renderCart();
})();
