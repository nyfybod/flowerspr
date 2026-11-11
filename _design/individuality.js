(() => {
 'use strict';
 const root=document.querySelector('.identity-hero'),dataNode=document.querySelector('#identity-data');
 if(!root||!dataNode)return;
 const d=JSON.parse(dataNode.textContent),$=s=>root.querySelector(s),$$=s=>[...root.querySelectorAll(s)];
 const photo=$('.identity-photo>img'),caption=$('.identity-photo figcaption'),out=$('.s-output');
 const money=v=>new Intl.NumberFormat('ru-RU',{style:'currency',currency:'RUB',maximumFractionDigits:0}).format(v);
 const showPhoto=(p)=>{if(!p)return;photo.src=p.image;photo.alt=p.name||d.name;caption.textContent=p.name||'Работа из фотогалереи магазина';};
 const pressed=(button,buttons)=>buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 const copy=async(text,button)=>{const status=$('.s-copy-status');status.textContent='Копирую текст…';try{await Promise.race([navigator.clipboard.writeText(text),new Promise((_,reject)=>setTimeout(()=>reject(new Error('Clipboard unavailable')),1500))]);status.textContent='Текст скопирован. Передайте его флористу удобным способом.';}catch{status.textContent='Выделите и скопируйте текст пожелания выше.';}button.textContent='Скопировать ещё раз';};
 const selectButtons=$$('[data-s-choice]');
 switch(d.type){
 case 'mood':
  selectButtons.forEach((b,i)=>b.addEventListener('click',()=>{pressed(b,selectButtons);showPhoto(d.picks[i]);out.textContent=d.picks[i].name+' · '+money(d.picks[i].price);}));break;
 case 'atelier': {
  const update=()=>{out.textContent=`Хочу букет ${$('#s-reason').value.toLowerCase()}, в ${$('#s-palette').value.toLowerCase()} палитре. Помогите подобрать состав и уточните стоимость.`;};
  $('#s-reason').addEventListener('change',update);$('#s-palette').addEventListener('change',update);update();
  $('#s-copy').addEventListener('click',e=>copy(out.textContent,e.currentTarget));break;}
 case 'postcard': {
  const input=$('#s-message'),preview=$('.s-postcard-preview');input.addEventListener('input',()=>{preview.textContent=input.value.trim()||'Пусть этот день будет чуть прекраснее.';});
  $('#s-copy').addEventListener('click',e=>copy(preview.textContent,e.currentTarget));break;}
 case 'roulette': {
  let previous=-1;$('#s-spin').addEventListener('click',()=>{let next;do{next=Math.floor(Math.random()*d.photos.length);}while(next===previous&&d.photos.length>1);previous=next;showPhoto(d.photos[next]);out.textContent='Идея найдена. Покажите эту фотографию флористу и обсудите доступный состав.';});break;}
 case 'walk': {
  const tour=$('.s-tour');let page=0;const go=delta=>{page=Math.max(0,Math.min(d.tour.length-1,page+delta));const target=tour.children[page];tour.scrollTo({left:target.offsetLeft-tour.children[0].offsetLeft,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});$('#s-tour-status').textContent=`Фото ${page+1} из ${d.tour.length}`;};$('#s-prev').addEventListener('click',()=>go(-1));$('#s-next').addEventListener('click',()=>go(1));break;}
 case 'herbarium':
  selectButtons.forEach((b,i)=>b.addEventListener('click',()=>{pressed(b,selectButtons);showPhoto(d.picks[i]);out.textContent=d.picks[i].name+' · '+money(d.picks[i].price);}));break;
 case 'plant': {
  const categories=['Кактусы и суккуленты','Комнатные ( горшечные) растения, домашние цветы','Комнатные деревья'];let selected=0;
  const notes=['Небольшие растения для вашего подоконника. Освещение и уход обсудите со специалистом.','Растения для домашней коллекции. Размер и подходящее место уточните у сотрудников.','Крупные растения и комнатные деревья. Сверьте размеры с местом в вашем доме.'];
  selectButtons.forEach((b,i)=>b.addEventListener('click',()=>{selected=i;pressed(b,selectButtons);out.textContent=notes[i];}));
  $('#s-plants').addEventListener('click',()=>{const filter=[...document.querySelectorAll('.filter')].find(b=>b.dataset.filter===categories[selected]);filter?.click();document.querySelector('#catalog').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});break;}
 case 'surprise':
  $('#s-unwrap').addEventListener('click',e=>{const card=$('#s-surprise-card'),open=card.hidden;card.hidden=!open;e.currentTarget.setAttribute('aria-expanded',String(open));e.currentTarget.textContent=open?'Скрыть пожелание':'Открыть пожелание ↗';out.textContent=open?'Эти слова можно добавить к вашему букету.':'Пара тёплых слов для вашего подарка.';});break;
 case 'calendar': {
  const input=$('#s-date');const now=new Date();const local=new Date(now.getTime()-now.getTimezoneOffset()*60000).toISOString().slice(0,10);input.value=local;
  const update=()=>{
   if(!input.value)return;
   const date=new Date(input.value+'T12:00:00');$('.s-calendar strong').textContent=date.getDate();$('.s-calendar span').textContent=new Intl.DateTimeFormat('ru-RU',{month:'long',weekday:'long'}).format(date);
   const start=input.value.replaceAll('-',''),end=new Date(input.value+'T12:00:00');end.setDate(end.getDate()+1);
   const endText=`${end.getFullYear()}${String(end.getMonth()+1).padStart(2,'0')}${String(end.getDate()).padStart(2,'0')}`;
   const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
   const content=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Flowerspr//Flower Reminder//RU','CALSCALE:GREGORIAN','BEGIN:VEVENT',`UID:flowers-${start}@flowerspr`,`DTSTAMP:${stamp}`,`DTSTART;VALUE=DATE:${start}`,`DTEND;VALUE=DATE:${endText}`,'SUMMARY:Выбрать цветы к вашему поводу','DESCRIPTION:Позвоните в магазин Время Цветов и согласуйте состав и стоимость.','END:VEVENT','END:VCALENDAR',''].join('\r\n');
   $('#s-remind').href='data:text/calendar;charset=utf-8,'+encodeURIComponent(content);
   out.textContent='Напоминание для вас. Наличие цветов и время получения подтвердите у магазина.';
  };
  input.addEventListener('change',update);update();
  $('#s-remind').addEventListener('click',e=>{if(!input.value){e.preventDefault();out.textContent='Сначала выберите дату.';}});break;}
 case 'supply': {
  const checks=$$('input[type=checkbox]');const update=()=>{const selected=checks.filter(x=>x.checked).map(x=>d.supplies[Number(x.value)].name);out.textContent=selected.length?selected.join('; '):'Отметьте товары, которые хотите обсудить с поставщиком.';};checks.forEach(x=>x.addEventListener('change',update));update();$('#s-copy').addEventListener('click',e=>copy('Прошу уточнить наличие, фасовку и оптовые/розничные условия: '+out.textContent,e.currentTarget));break;}
 case 'window':
  selectButtons.forEach((b,i)=>b.addEventListener('click',()=>{pressed(b,selectButtons);showPhoto(d.window[i]);out.textContent=i?'Примеры цветочных работ магазина.':'Соборная, 3. Сверьте маршрут на карте перед визитом.';}));break;
 case 'party': {
  const palettes=[['#efd29b','#e3ad92','#f5e5bf'],['#bca4d2','#e1c9e8','#a0b4cd'],['#e86b93','#edb935','#8a68b6']];selectButtons.forEach((b,i)=>b.addEventListener('click',()=>{pressed(b,selectButtons);['--party-a','--party-b','--party-c'].forEach((k,j)=>root.style.setProperty(k,palettes[i][j]));out.textContent=`Мне нравится ${b.textContent.toLowerCase()} палитра. Какие цветы или шары в этих оттенках есть в наличии?`;}));break;}
 case 'showcase':
  selectButtons.forEach((b,i)=>b.addEventListener('click',()=>{pressed(b,selectButtons);$('.s-photo-grid').dataset.close=String(i===1);out.textContent=i?'Одна из работ магазина крупным планом.':'Несколько работ и цветочная витрина магазина.';}));break;
 case 'storybook': {
  const titles=['Выберите настроение','Обсудите детали','Порадуйте близкого'];const text=['Вспомните любимые цветы и оттенки человека, которому дарите букет.','Назовите флористу повод, бюджет и время. Уточните состав и упаковку.','Перед получением подтвердите готовность. Попросите рекомендации по уходу.'];selectButtons.forEach((b,i)=>b.addEventListener('click',()=>{pressed(b,selectButtons);showPhoto(d.chapters[i]);$('.s-chapter').textContent=titles[i];out.textContent=text[i];}));break;}
 case 'wishlist': {
  const key='flowerspr-ideas-'+d.slug,checks=$$('input[type=checkbox]');let stored=[];try{stored=JSON.parse(localStorage.getItem(key)||'[]');if(!Array.isArray(stored))stored=[];}catch{}checks.forEach(x=>x.checked=stored.includes(x.value));
  const update=()=>{const selected=checks.filter(x=>x.checked).map(x=>x.value);out.textContent=selected.length?`Сохранено идей: ${selected.length}. Это ваши ориентиры для разговора с флористом.`:'Отметьте понравившиеся фотографии.';try{localStorage.setItem(key,JSON.stringify(selected));}catch{out.textContent+=' Сохранение в этом браузере недоступно.';}};checks.forEach(x=>x.addEventListener('change',update));update();break;}
 case 'pair': {
  let i=0;$('#s-pair-next').addEventListener('click',()=>{i=(i+1)%d.picks.length;const gift=d.picks[i],figure=$('.s-mini-bouquet');figure.querySelector('img').src=gift.image;figure.querySelector('img').alt=gift.name;figure.querySelector('figcaption').textContent=gift.name;figure.querySelector('strong').textContent=money(gift.price);out.textContent='Цена букета и дополнения указана отдельно. Наличие уточните у флориста.';});break;}
 case 'aroundclock': {
  const hour=Number(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Moscow',hour:'2-digit',hourCycle:'h23'}).format(new Date()));document.body.dataset.daymode=hour>=8&&hour<20?'day':'night';const clock=()=>{$('.s-clock').textContent=new Intl.DateTimeFormat('ru-RU',{timeZone:'Europe/Moscow',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date());};clock();setInterval(clock,60000);
  const modes=$$('[data-s-mode]');modes.forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.sMode===document.body.dataset.daymode));b.addEventListener('click',()=>{document.body.dataset.daymode=b.dataset.sMode;pressed(b,modes);});});selectButtons.forEach((b,i)=>b.addEventListener('click',()=>{pressed(b,selectButtons);out.textContent=i?'Назовите адрес и желаемое время. Тариф и возможность доставки подтвердит магазин.':'Ново-Никольская улица, 40. Позвоните и уточните наличие перед визитом.';}));break;}
 case 'occasion': {
  const questions=[['Для кого выбираем?',['Для близкого человека','Для друга','Для коллеги']],['Какой повод?',['День рождения','Сказать спасибо','Просто так']],['Какие ощущения?',['Нежно и спокойно','Ярко и празднично','Доверюсь флористу']]];let step=0;const answers=[];const box=$('.s-quiz-options'),title=$('.s-quiz-title');const back=$('#s-back');
  function paint(){const done=step===questions.length;title.textContent=done?'Ваше цветочное пожелание':questions[step][0];$$('.s-progress span').forEach((s,i)=>s.classList.toggle('active',i<=step));box.replaceChildren();back.hidden=step===0;
   if(done){out.textContent=`Выбираю букет: ${answers.join(' · ')}. Помогите определиться с составом и стоимостью.`;return;}out.textContent='Выберите один вариант.';questions[step][1].forEach(text=>{const b=document.createElement('button');b.className='s-button';b.type='button';b.textContent=text;b.addEventListener('click',()=>{answers[step]=text;step++;paint();title.focus();});box.append(b);});}
  back.addEventListener('click',()=>{step=Math.max(0,step-1);paint();title.focus();});paint();break;}
 }
})();
