export function openDiagram(title:string,path:string,category:string){
 document.querySelector<HTMLDialogElement>('#diagram-dialog')?.close();document.querySelector('#diagram-dialog')?.remove();
 const previousFocus=document.activeElement as HTMLElement|null;
 const dialog=document.createElement('dialog');dialog.id='diagram-dialog';dialog.className='diagram-dialog';dialog.setAttribute('aria-labelledby','diagram-title');
 dialog.innerHTML='<div class="diagram-dialog-header"><div><p id="diagram-category"></p><h2 id="diagram-title"></h2></div><button class="icon-button" id="diagram-close" aria-label="ปิดภาพ">×</button></div><div class="diagram-viewer-toolbar"><div><button class="button" id="zoom-out" aria-label="ย่อภาพ">−</button><output id="zoom-value" aria-live="polite">100%</output><button class="button" id="zoom-in" aria-label="ขยายภาพ">+</button><button class="button" id="zoom-fit">พอดีกรอบ</button></div><a class="button" id="diagram-download" download>ดาวน์โหลด SVG</a></div><div class="diagram-dialog-stage" tabindex="0" aria-label="ภาพประกอบ เลื่อนเพื่อดูส่วนที่ขยาย"><div class="diagram-image-canvas"><img id="diagram-image"></div></div><p class="diagram-viewer-hint">กด + / − เพื่อขยายหรือย่อ · เลื่อนเพื่อดูรายละเอียด · Esc เพื่อปิด</p>';
 dialog.querySelector('#diagram-title')!.textContent=title;dialog.querySelector('#diagram-category')!.textContent=category;
 const img=dialog.querySelector<HTMLImageElement>('#diagram-image')!;img.alt=title;
 const download=dialog.querySelector<HTMLAnchorElement>('#diagram-download')!;download.href=path;
 const stage=dialog.querySelector<HTMLElement>('.diagram-dialog-stage')!,canvas=dialog.querySelector<HTMLElement>('.diagram-image-canvas')!;
 let zoom=1;
 const fit=()=>Math.min(Math.max(100,stage.clientWidth-48)/Math.max(1,img.naturalWidth),Math.max(100,stage.clientHeight-48)/Math.max(1,img.naturalHeight));
 const update=()=>{
  if(!img.naturalWidth)return;
  const scale=fit()*zoom,width=Math.round(img.naturalWidth*scale),height=Math.round(img.naturalHeight*scale);
  img.style.width=width+'px';img.style.height=height+'px';canvas.style.width=Math.max(stage.clientWidth,width+48)+'px';canvas.style.height=Math.max(stage.clientHeight,height+48)+'px';
  dialog.querySelector('#zoom-value')!.textContent=Math.round(zoom*100)+'%';
  dialog.querySelector<HTMLButtonElement>('#zoom-out')!.disabled=zoom<=.5;dialog.querySelector<HTMLButtonElement>('#zoom-in')!.disabled=zoom>=4;
 };
 const change=(factor:number)=>{zoom=Math.min(4,Math.max(.5,zoom*factor));update();};
 dialog.querySelector('#zoom-in')!.addEventListener('click',()=>change(1.25));dialog.querySelector('#zoom-out')!.addEventListener('click',()=>change(.8));
 dialog.querySelector('#zoom-fit')!.addEventListener('click',()=>{zoom=1;update();stage.scrollTo(0,0);});
 dialog.querySelector('#diagram-close')!.addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
 dialog.addEventListener('keydown',event=>{if(event.key==='+'||event.key==='='){event.preventDefault();change(1.25);}if(event.key==='-'){event.preventDefault();change(.8);}});
 const resize=new ResizeObserver(update);resize.observe(stage);
 dialog.addEventListener('close',()=>{resize.disconnect();dialog.remove();document.body.style.overflow='';previousFocus?.focus();},{once:true});
 document.body.append(dialog);document.body.style.overflow='hidden';dialog.showModal();img.onload=update;img.src=path;
}
