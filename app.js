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
    var s=JSON.parse(localStorage.getItem('asa_menu'));
    if(s)return DEFAULTS.map(function(d){var o=s[d.id]||{};return Object.assign({},d,{price:o.price||d.price,out:!!o.out})});
  }catch(e){}
  return DEFAULTS.map(function(d){return Object.assign({},d,{out:false})});
}

var items=load(), cart={}, tab='all';

function save(){
  try{
    var o={};
    items.forEach(function(i){o[i.id]={price:i.price,out:i.out}});
    localStorage.setItem('asa_menu',JSON.stringify(o));
  }catch(e){}
}

/* ---------- menu ---------- */
function renderMenu(){
  var m=$('#menu-grid');
  if(!m)return;
  $('#tabs').innerHTML=TABS.map(function(t){
    return '<button class="tab" role="tab" data-t="'+t[0]+'" aria-selected="'+(t[0]===tab)+'">'+t[1]+'</button>';
  }).join('');

  m.innerHTML=items.filter(function(i){
    return tab==='all'||i.cats.indexOf(tab)>-1;
  }).map(function(i){
    return '<article class="item'+(i.out?' out':'')+'">' +
      '<div class="ph"><img loading="lazy" alt="'+i.name+'" src="'+imgBase(i.img)+'"></div>' +
      '<div class="bd">' +
        '<h3>'+i.name+'</h3>' +
        '<p style="font-size:0.8rem; color:var(--taupe); line-height:1.4;">'+(i.desc||'')+'</p>' +
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

  $('#cart-list').innerHTML=k.lines.map(function(l){
    return '<div class="ci"><span>'+l.i.name+'<br><small style="color:var(--taupe)">'+naira(l.i.price)+' each</small></span><span class="qty"><button aria-label="Remove one" data-q="-1" data-id="'+l.i.id+'">&minus;</button>'+l.q+'<button aria-label="Add one" data-q="1" data-id="'+l.i.id+'">+</button></span></div>';
  }).join('');

  var b=$('#cart-go');
  b.textContent=k.n+' Item'+(k.n>1?'s':'')+' • '+naira(k.tot)+' — Order via WhatsApp';
  b.href=wa('*PRE-ORDER — ASA BAR & KITCHEN*

'+k.lines.map(function(l){return l.q+' x '+l.i.name+' ('+naira(l.q*l.i.price)+')'}).join('
')+'

*Total Amount:* '+naira(k.tot)+'

_Please confirm availability and preparation time._');
}

var tg=$('#cart-toggle');
if(tg)tg.onclick=function(){
  var c=$('#cart');
  c.classList.toggle('open');
  tg.setAttribute('aria-expanded',c.classList.contains('open'));
};

/* ---------- staff modal ---------- */
var ov=$('#staff'), lastFocus;
function openStaff(){
  lastFocus=document.activeElement;
  ov.classList.add('show');
  $('#pin-view').classList.remove('hide');
  $('#edit-view').classList.add('hide');
  $('#pin').value='';
  $('#pin-err').textContent='';
  setTimeout(function(){$('#pin').focus()},50);
}
function closeStaff(){
  ov.classList.remove('show');
  if(lastFocus)lastFocus.focus();
}

function drawEditor(){
  $('#edit-list').innerHTML=items.map(function(i){
    return '<div class="srow"><div>'+i.name+'</div><input type="number" min="0" step="100" data-p="'+i.id+'" value="'+i.price+'"><label style="font-size:0.78rem; display:flex; align-items:center; gap:4px;"><input type="checkbox" data-o="'+i.id+'"'+(i.out?' checked':'')+'> Sold Out</label></div>';
  }).join('');
}

$$('[data-staff]').forEach(function(b){b.onclick=openStaff});
if(ov){
  $('#staff-close').onclick=closeStaff;
  ov.addEventListener('click',function(e){if(e.target===ov)closeStaff();});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&ov.classList.contains('show'))closeStaff();});

  $('#pin-form').onsubmit=function(e){
    e.preventDefault();
    if($('#pin').value==='1234'){
      $('#pin-view').classList.add('hide');
      $('#edit-view').classList.remove('hide');
      drawEditor();
    }else{
      $('#pin-err').textContent='Incorrect PIN. Enter 1234.';
      $('#pin').select();
    }
  };

  $('#save').onclick=function(){
    $$('[data-p]').forEach(function(inp){
      var it=items.filter(function(i){return i.id==inp.dataset.p})[0], v=parseInt(inp.value,10);
      if(v>=0)it.price=v;
    });
    $$('[data-o]').forEach(function(c){
      items.filter(function(i){return i.id==c.dataset.o})[0].out=c.checked;
    });
    save();
    renderMenu();
    renderCart();
    $('#save-msg').textContent='Published live to menu!';
  };

  $('#reset').onclick=function(){
    items=DEFAULTS.map(function(d){return Object.assign({},d,{out:false})});
    save();
    drawEditor();
    renderMenu();
    renderCart();
    $('#save-msg').textContent='Factory prices restored.';
  };
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
    r.className='res show';
    r.innerHTML=n>=4 ?
      '<p>Thank you for dining with us! A review on Google Maps helps other Bodija diners discover ASA.</p><a class="btn gold" target="_blank" rel="noopener" href="'+MAPS+'">Post Review on Google Maps &rarr;</a>' :
      '<p><b>Private Note to General Manager:</b> We hold ourselves to high standards. Tell the manager directly so we can resolve this before you leave.</p><a class="btn" style="border-color:var(--gold); color:var(--gold);" target="_blank" rel="noopener" href="'+wa('Hello, I am at ASA and rated my visit '+n+'/5. Here is what we need fixed: ')+'">Message Manager on WhatsApp &rarr;</a>';
  };
}

renderMenu();
renderCart();
})();
