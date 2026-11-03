(function(){
var WA='2348029743214';
var MAPS='https://www.google.com/maps/search/?api=1&query=%C3%80S%C3%80+Bar+and+Kitchen+26+Osuntokun+Avenue+Old+Bodija+Ibadan';
var DEFAULTS=[
{id:1,name:'ÀSÀ Signature Jollof & Jumbo Asun',price:9500,cats:['sig'],img:'signature_jollof_dish.jpg',e:'🍛'},
{id:2,name:'Whole Grilled Croaker & Spiced Yam',price:15500,cats:['grill','sig'],e:'🐟'},
{id:3,name:'Chicken Suya Saté Skewers (4pcs)',price:7800,cats:['grill'],e:'🍢'},
{id:4,name:'Sunset Afro-Smash Cocktail',price:8500,cats:['cock'],img:'craft_cocktails.jpg',e:'🍹'},
{id:5,name:'Old Bodija Smoked Old Fashioned',price:10500,cats:['cock'],e:'🥃'},
{id:6,name:'VIP Hennessy VSOP & Shisha Suite',price:165000,cats:['vip'],e:'🍾'}];
var TABS=[['all','✨ All Offerings'],['grill','🍢 Grills & Suya Platters'],['sig','🍛 Signature Afro-Continental'],['cock','🍹 Sunset Cocktails'],['vip','🍾 VIP Bottle & Shisha']];
var $=function(s,r){return(r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var naira=function(n){return '₦'+Number(n).toLocaleString('en-NG')};
var wa=function(t){return 'https://wa.me/'+WA+'?text='+encodeURIComponent(t)};
var imgBase=(window.ASA_IMG||function(n){return 'assets/'+n});
function load(){try{var s=JSON.parse(localStorage.getItem('asa_menu'));if(s)return DEFAULTS.map(function(d){var o=s[d.id]||{};return Object.assign({},d,{price:o.price||d.price,out:!!o.out})})}catch(e){}return DEFAULTS.map(function(d){return Object.assign({},d,{out:false})})}
var items=load(),cart={},tab='all';
function save(){try{var o={};items.forEach(function(i){o[i.id]={price:i.price,out:i.out}});localStorage.setItem('asa_menu',JSON.stringify(o))}catch(e){}}
/* ---------- menu ---------- */
function renderMenu(){var m=$('#menu-grid');if(!m)return;
$('#tabs').innerHTML=TABS.map(function(t){return '<button class="tab" role="tab" data-t="'+t[0]+'" aria-selected="'+(t[0]===tab)+'">'+t[1]+'</button>'}).join('');
m.innerHTML=items.filter(function(i){return tab==='all'||i.cats.indexOf(tab)>-1}).map(function(i){
return '<article class="item'+(i.out?' out':'')+'"><div class="ph">'+(i.img?'<img loading="lazy" alt="'+i.name+'" src="'+imgBase(i.img)+'">':i.e)+'</div><div class="bd"><h3>'+i.name+'</h3><div class="row"><span class="pr">'+naira(i.price)+'</span>'+(i.out?'<span class="tag">Sold out today</span>':'<button class="btn gold sm" data-add="'+i.id+'">+ Add to Pre-Order</button>')+'</div></div></article>'}).join('');}
document.addEventListener('click',function(e){var t=e.target.closest('[data-t]');if(t){tab=t.dataset.t;renderMenu()}
var a=e.target.closest('[data-add]');if(a){cart[a.dataset.add]=(cart[a.dataset.add]||0)+1;renderCart()}
var q=e.target.closest('[data-q]');if(q){var id=q.dataset.id;cart[id]=(cart[id]||0)+Number(q.dataset.q);if(cart[id]<=0)delete cart[id];renderCart()}});
/* ---------- cart ---------- */
function cartInfo(){var n=0,tot=0,lines=[];items.forEach(function(i){var q=cart[i.id];if(q&&!i.out){n+=q;tot+=q*i.price;lines.push({i:i,q:q})}});return{n:n,tot:tot,lines:lines}}
function renderCart(){var c=$('#cart');if(!c)return;var k=cartInfo();c.classList.toggle('show',k.n>0);if(!k.n)c.classList.remove('open');
$('#cart-list').innerHTML=k.lines.map(function(l){return '<div class="ci"><span>'+l.i.name+'<br><small style="color:var(--muted)">'+naira(l.i.price)+' each</small></span><span class="qty"><button aria-label="Remove one" data-q="-1" data-id="'+l.i.id+'">−</button>'+l.q+'<button aria-label="Add one" data-q="1" data-id="'+l.i.id+'">+</button></span></div>'}).join('');
var b=$('#cart-go');b.textContent='🛒 '+k.n+' Item'+(k.n>1?'s':'')+' • '+naira(k.tot)+' ➔ Order via WhatsApp';
b.href=wa('*PRE-ORDER — ÀSÀ KITCHEN*\n\n'+k.lines.map(function(l){return l.q+' x '+l.i.name+' — '+naira(l.q*l.i.price)}).join('\n')+'\n\n*Total:* '+naira(k.tot)+'\n\n_Please confirm availability and when it will be ready._')}
var tg=$('#cart-toggle');if(tg)tg.onclick=function(){var c=$('#cart');c.classList.toggle('open');tg.setAttribute('aria-expanded',c.classList.contains('open'))};
/* ---------- staff modal ---------- */
var ov=$('#staff'),lastFocus;
function openStaff(){lastFocus=document.activeElement;ov.classList.add('show');$('#pin-view').classList.remove('hide');$('#edit-view').classList.add('hide');$('#pin').value='';$('#pin-err').textContent='';setTimeout(function(){$('#pin').focus()},50)}
function closeStaff(){ov.classList.remove('show');if(lastFocus)lastFocus.focus()}
function drawEditor(){$('#edit-list').innerHTML=items.map(function(i){return '<div class="srow"><div>'+i.name+'<small>'+TABS.filter(function(t){return i.cats.indexOf(t[0])>-1}).map(function(t){return t[1].replace(/^\S+\s/,'')}).join(', ')+'</small></div><input type="number" min="0" step="100" inputmode="numeric" aria-label="Price for '+i.name+'" data-p="'+i.id+'" value="'+i.price+'"><label><input type="checkbox" data-o="'+i.id+'"'+(i.out?' checked':'')+'> Sold out</label></div>'}).join('')}
$$('[data-staff]').forEach(function(b){b.onclick=openStaff});
if(ov){$('#staff-close').onclick=closeStaff;ov.addEventListener('click',function(e){if(e.target===ov)closeStaff()});document.addEventListener('keydown',function(e){if(e.key==='Escape'&&ov.classList.contains('show'))closeStaff()});
$('#pin-form').onsubmit=function(e){e.preventDefault();if($('#pin').value==='1234'){$('#pin-view').classList.add('hide');$('#edit-view').classList.remove('hide');drawEditor()}else{$('#pin-err').textContent='That PIN isn’t right. Enter the 4-digit manager PIN.';$('#pin').select()}};
$('#save').onclick=function(){$$('[data-p]').forEach(function(inp){var it=items.filter(function(i){return i.id==inp.dataset.p})[0],v=parseInt(inp.value,10);if(v>=0)it.price=v});$$('[data-o]').forEach(function(c){items.filter(function(i){return i.id==c.dataset.o})[0].out=c.checked});save();renderMenu();renderCart();$('#save-msg').textContent='Published. The live menu now shows these prices.'};
$('#reset').onclick=function(){items=DEFAULTS.map(function(d){return Object.assign({},d,{out:false})});save();drawEditor();renderMenu();renderCart();$('#save-msg').textContent='Factory prices restored.'}}
/* ---------- reputation ---------- */
var st=$('#stars');if(st){st.innerHTML=[1,2,3,4,5].map(function(n){return '<button class="star" data-s="'+n+'" aria-label="'+n+' star'+(n>1?'s':'')+'">★</button>'}).join('');
st.onclick=function(e){var b=e.target.closest('[data-s]');if(!b)return;var n=+b.dataset.s;$$('.star',st).forEach(function(s){s.classList.toggle('on',+s.dataset.s<=n)});var r=$('#res');r.className='res show';
r.innerHTML=n>=4?'<p>🎉 Thank you! We’re so glad you enjoyed ÀSÀ. A quick review on Google Maps helps other diners in Bodija find us.</p><a class="btn gold" target="_blank" rel="noopener" href="'+MAPS+'">🌟 Post 5-Star Review on Google Maps</a>':'<p>🛡️ <b>Private Message to General Manager:</b> Tell the on-duty manager directly so we can resolve your issue right now at your table before you leave.</p><a class="btn wa" target="_blank" rel="noopener" href="'+wa('Hello, I’m at ÀSÀ and rated my visit '+n+'/5. Here is what went wrong: ')+'">Message the Manager on WhatsApp</a>'}}
/* ---------- VIP form ---------- */
var f=$('#vf');
if(f){var zones={pool:['Poolside Cabana','cabanas'],roof:['Rooftop Sky Lounge','roof'],hall:['Culture Dining Hall','hall']},zone='pool';
var d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());var today=d.toISOString().slice(0,10);$('#date').min=today;$('#date').value=today;
function pickZone(z){zone=z;$$('.zcard').forEach(function(c){c.setAttribute('aria-checked',c.dataset.z===z)});man()}
$$('.zcard').forEach(function(c){c.onclick=function(){pickZone(c.dataset.z)}});
var val=function(id){var e=document.getElementById(id);return e.options?e.options[e.selectedIndex].text:e.value.trim()};
function man(){$('#m-name').textContent=val('name')||'—';$('#m-wa').textContent=val('phone')||'—';var dt=$('#date').value;$('#m-when').textContent=(dt?dt+' @ ':'')+val('time');$('#m-zone').textContent=zones[zone][0];$('#m-size').textContent=val('size');$('#m-occ').textContent=val('occ')}
$$('#vf input,#vf select,#vf textarea').forEach(function(x){x.addEventListener('input',man)});man();
f.onsubmit=function(e){e.preventDefault();var ok=true;
function chk(id,bad,msg){var er=document.getElementById(id+'-err');er.textContent=bad?msg:'';if(bad)ok=false}
chk('name',val('name').length<2,'Enter the name for the booking.');
chk('phone',val('phone').replace(/\D/g,'').length<10,'Enter a WhatsApp number with at least 10 digits.');
chk('date',!$('#date').value||$('#date').value<today,'Choose today or a future date.');
if(!ok){var first=$('.err:not(:empty)');if(first)first.previousElementSibling.focus();return}
var note=val('notes');
var msg='*VIP TABLE RESERVATION MANIFEST — ÀSÀ KITCHEN*\n\n*Guest Name:* '+val('name')+'\n*WhatsApp:* '+val('phone')+'\n*Date & Time:* '+$('#date').value+' @ '+val('time')+'\n*Section Requested:* '+zones[zone][0]+'\n*Party Size:* '+val('size')+'\n*Occasion:* '+val('occ')+(note?'\n*Special Request:* '+note:'')+'\n\n_Please confirm availability and assign table number._';
window.open(wa(msg),'_blank','noopener')}}
/* ---------- preview router (single-file build only) ---------- */
var H=$('#view-home'),V=$('#view-vip');
if(H&&V){function route(){var vip=location.hash==='#vip';H.classList.toggle('hide',vip);V.classList.toggle('hide',!vip);if(vip)window.scrollTo(0,0);else if(location.hash.length>1){var t=document.getElementById(location.hash.slice(1));setTimeout(function(){t?t.scrollIntoView():window.scrollTo(0,0)},30)}}
window.addEventListener('hashchange',route);route()}
renderMenu();renderCart();
})();
