// Convert draw.io teaching diagrams into bounded, accessible SVG study plates.
// All labels are treated as data. No scripts, remote images or foreignObject.
const palette={ink:'#172345',muted:'#6b7591',line:'#b9cbed',blue:'#1f6fe5',paper:'#ffffff',canvas:'#f8fbff'};
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const decode=s=>s.replace(/&(?:amp|lt|gt|quot|apos|nbsp|#\d+|#x[\da-f]+);/gi,c=>{const named={'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&apos;':"'",'&nbsp;':' '};return named[c]??String.fromCodePoint(c.startsWith('&#x')?parseInt(c.slice(3),16):parseInt(c.slice(2),10));});
const attrs=s=>Object.fromEntries([...s.matchAll(/([\w:-]+)="([^"]*)"/g)].map(m=>[m[1],decode(m[2])]));
const number=(v,fallback=0)=>Number.isFinite(Number(v))?Number(v):fallback;
function plainLabel(value){return decode(value.replace(/<(?:br\s*\/?|\/div|\/p|\/li)>/gi,'\n').replace(/<\/?(?:b|i|u|strong|em|div|p|span|font|ul|ol|li)(?:\s[^>]*)?>/gi,'')).trim();}
function textWidth(text,size){return [...text].reduce((w,c)=>w+(/[ilI.,'`:;!|\s]/.test(c)?.31:/[MW@#%]/.test(c)?.87:/[A-Z]/.test(c)?.68:/[^\x00-\x7f]/.test(c)?.72:.57)*size,0);}
export function wrapLabel(text,width,fontSize){
 const lines=[];
 for(const paragraph of text.split('\n')){
  if(!paragraph.trim()){lines.push('');continue;}
  let line='';
  for(const token of paragraph.trim().split(/(\s+)/)){
   if(textWidth(line+token,fontSize)<=width){line+=token;continue;}
   if(line.trim()){lines.push(line.trim());line='';}
   if(textWidth(token,fontSize)<=width){line=token.trimStart();continue;}
   for(const char of token){if(textWidth(line+char,fontSize)>width&&line){lines.push(line);line='';}line+=char;}
  }
  if(line.trim())lines.push(line.trim());
 }
 return lines;
}
const fills={'#dae8fc':'#eaf2ff','#d5e8d4':'#e8f6ee','#fff2cc':'#fff4dc','#e1d5e7':'#f0eafa','#f8cecc':'#fdeef0','#ffe6cc':'#fff1e4','#f5f5f5':'#f1f5fb'};
function paint(value,fallback){if(value==='none')return 'none';if(!/^#[\da-f]{3,8}$/i.test(value||''))return fallback;const v=value.toLowerCase();return fills[v]||(['#000000','#080808','#333333','#000'].includes(v)?palette.ink:v);}
export function renderDiagram(graph,title){
 const cells=[...graph.matchAll(/<mxCell\b([^>]*?)(?:\/>|>([\s\S]*?)<\/mxCell>)/g)].map(m=>{
  const a=attrs(m[1]),body=m[2]||'',g=attrs(body.match(/<mxGeometry\b([^>]*)/)?.[1]||'');
  const style=Object.fromEntries((a.style||'').split(';').filter(Boolean).map(token=>{const i=token.indexOf('=');return i<0?[token,true]:[token.slice(0,i),token.slice(i+1)];}));
  return {...a,g,body,style,x:number(g.x),y:number(g.y),w:Math.max(0,number(g.width)),h:Math.max(0,number(g.height))};
 });
 const byId=new Map(cells.map(c=>[c.id,c]));
 function visible(c,seen=new Set()){if(!c||seen.has(c.id))return true;if(c.visible==='0')return false;seen.add(c.id);return visible(byId.get(c.parent),seen);}
 function position(c,seen=new Set()){
  if(!c||seen.has(c.id))return{x:0,y:0};seen.add(c.id);
  const parent=byId.get(c.parent),offset=attrs(c.body.match(/<mxPoint\b([^>]*\bas="offset"[^>]*)/)?.[1]||'');
  const p=parent?.vertex==='1'?position(parent,seen):{x:0,y:0};
  return{x:p.x+c.x*(c.g.relative==='1'&&parent?.vertex==='1'?parent.w:1)+number(offset.x),y:p.y+c.y*(c.g.relative==='1'&&parent?.vertex==='1'?parent.h:1)+number(offset.y)};
 }
 const vertices=cells.filter(c=>c.vertex==='1'&&visible(c)&&c.style.shape!=='group').map(c=>({...c,...position(c)}));
 const verticesById=new Map(vertices.map(c=>[c.id,c]));
 const extents=vertices.flatMap(c=>[{x:c.x,y:c.y},{x:c.x+c.w,y:c.y+c.h}]);
 const edgePaths=[],edgeLabels=[];
 function boundary(node,toward,x,y){
  if(x!==undefined&&y!==undefined)return{x:node.x+number(x)*node.w,y:node.y+number(y)*node.h};
  const cx=node.x+node.w/2,cy=node.y+node.h/2,dx=toward.x-cx,dy=toward.y-cy;
  if(!dx&&!dy)return{x:cx,y:cy};
  const scale=node.style.ellipse?1/Math.sqrt((dx/(node.w/2||1))**2+(dy/(node.h/2||1))**2):1/Math.max(Math.abs(dx)/(node.w/2||1),Math.abs(dy)/(node.h/2||1));
  return{x:cx+dx*scale,y:cy+dy*scale};
 }
 for(const edge of cells.filter(c=>c.edge==='1'&&visible(c))){
  const points=[...edge.body.matchAll(/<mxPoint\b([^>]*)\/?\s*>/g)].map(m=>attrs(m[1]));
  const source=verticesById.get(edge.source),target=verticesById.get(edge.target);
  const origin=source?{x:source.x+source.w/2,y:source.y+source.h/2}:points.find(p=>p.as==='sourcePoint');
  const destination=target?{x:target.x+target.w/2,y:target.y+target.h/2}:points.find(p=>p.as==='targetPoint');
  if(!origin||!destination)continue;
  const controls=points.filter(p=>!p.as).map(p=>({x:number(p.x),y:number(p.y)}));
  const end=target?boundary(target,controls.at(-1)||origin,edge.style.entryX,edge.style.entryY):{x:number(destination.x),y:number(destination.y)};
  const start=source?boundary(source,controls[0]||destination,edge.style.exitX,edge.style.exitY):{x:number(origin.x),y:number(origin.y)};
  let route=[start,...controls,end];
  if(!controls.length&&edge.style.edgeStyle==='orthogonalEdgeStyle'&&Math.abs(start.x-end.x)>2&&Math.abs(start.y-end.y)>2){
   const horizontal=edge.style.exitX==='0'||edge.style.exitX==='1'||Math.abs(start.x-end.x)>Math.abs(start.y-end.y);
   route=horizontal?[start,{x:(start.x+end.x)/2,y:start.y},{x:(start.x+end.x)/2,y:end.y},end]:[start,{x:start.x,y:(start.y+end.y)/2},{x:end.x,y:(start.y+end.y)/2},end];
  }
  extents.push(...route);
  const stroke=paint(edge.style.strokeColor,palette.muted);
  const path=route.map((p,i)=>`${i?'L':'M'}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
  edgePaths.push(`<path d="${path}" fill="none" stroke="${stroke===palette.ink?palette.muted:stroke}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${edge.style.dashed==='1'?'stroke-dasharray="6 5"':''} ${edge.style.startArrow&&edge.style.startArrow!=='none'?'marker-start="url(#arrow)"':''} ${edge.style.endArrow==='none'?'':'marker-end="url(#arrow)"'}/>`);
  const label=plainLabel(edge.value||'');if(label){const middle=route[Math.floor(route.length/2)],w=Math.min(220,Math.max(90,textWidth(label,12)+20));const item={...edge,x:middle.x-w/2,y:middle.y-30,w,h:50,value:label,style:{text:true,fontSize:12}};edgeLabels.push(item);extents.push({x:item.x,y:item.y},{x:item.x+item.w,y:item.y+item.h});}
 }
 const padding=36;
 const minX=Math.min(...extents.map(p=>p.x),0===extents.length?0:Infinity)-padding;
 const minY=Math.min(...extents.map(p=>p.y),0===extents.length?0:Infinity)-padding;
 const width=Math.max(180,Math.max(...extents.map(p=>p.x),minX+180)-minX+padding),height=Math.max(110,Math.max(...extents.map(p=>p.y),minY+110)-minY+padding);
 const shapes=[],labels=[];
 for(const node of [...vertices,...edgeLabels]){
  const isText=!!node.style.text||node.style.shape==='text';
  let fill=paint(node.style.fillColor,'#ffffff'),stroke=paint(node.style.strokeColor,palette.line);
  const hasLabel=!!plainLabel(node.value||'');
  if(stroke===palette.ink)stroke=palette.line;
  if(fill==='#ffffff'&&hasLabel&&!isText)fill='#f7faff';
  if(node.style.shape==='image'){
   const cx=node.x+node.w/2,cy=node.y+node.h*.3,r=Math.min(node.w*.18,node.h*.18);
   shapes.push(`<g fill="none" stroke="${palette.blue}" stroke-width="2.2" stroke-linecap="round"><circle cx="${cx}" cy="${cy}" r="${r}"/><path d="M${node.x+node.w*.16} ${node.y+node.h*.86} C${node.x+node.w*.16} ${node.y+node.h*.48} ${node.x+node.w*.84} ${node.y+node.h*.48} ${node.x+node.w*.84} ${node.y+node.h*.86}"/></g>`);
  }else if(node.style.shape==='curlyBracket'){
   const x=node.x+node.w/2,y=node.y,h=node.h;
   shapes.push(`<path d="M${x+node.w/2} ${y} Q${x} ${y} ${x} ${y+h/4} L${x} ${y+h*.4} Q${x} ${y+h/2} ${node.x} ${y+h/2} Q${x} ${y+h/2} ${x} ${y+h*.6} L${x} ${y+h*.75} Q${x} ${y+h} ${x+node.w/2} ${y+h}" fill="none" stroke="${palette.blue}" stroke-width="2"/>`);
  }else if(!isText&&node.w>0&&node.h>0){
   if(node.style.ellipse)shapes.push(`<ellipse cx="${node.x+node.w/2}" cy="${node.y+node.h/2}" rx="${node.w/2}" ry="${node.h/2}" fill="${fill===palette.ink?palette.blue:fill}" stroke="${fill===palette.ink?palette.blue:stroke}" stroke-width="1.5"/>`);
   else shapes.push(`<rect x="${node.x}" y="${node.y}" width="${node.w}" height="${node.h}" rx="${Math.min(8,node.w*.12,node.h*.12)}" fill="${fill===palette.ink?palette.blue:fill}" stroke="${stroke}" stroke-width="1.3"/>`);
  }
  if(!hasLabel)continue;
  const text=plainLabel(node.value),inset=isText?2:Math.min(12,node.w*.08),availableW=Math.max(8,node.w-inset*2),availableH=Math.max(8,node.h-(isText?2:10));
  let size=Math.min(isText?26:20,Math.max(12,number(node.style.fontSize,15)));
  const longest=Math.max(...text.split(/\s+/).map(token=>textWidth(token,size)));
  if(longest>availableW&&text.length<=24)size=Math.max(8,size*availableW/longest);
  let lines=wrapLabel(text,availableW,size);
  while(size>7&&lines.length*size*1.3>availableH){size-=.5;lines=wrapLabel(text,availableW,size);}
  if(lines.length*size*1.3>availableH)size=availableH/(lines.length*1.3);
  const left=node.style.align==='left',x=left?node.x+inset:node.x+node.w/2;
  const lineHeight=size*1.3,firstY=node.y+node.h/2-(lines.length-1)*lineHeight/2+size*.34;
  const weight=number(node.style.fontStyle)&1?'600':isText&&size>=20?'600':'450';
  labels.push(`<text data-kind="${isText?'text':'label'}" data-box="${node.x} ${node.y} ${node.w} ${node.h}" fill="${palette.ink}" font-family="Inter,Arial,sans-serif" font-size="${size}" font-weight="${weight}" text-anchor="${left?'start':'middle'}">${lines.map((line,i)=>{const estimate=textWidth(line,size);return `<tspan x="${x}" y="${firstY+i*lineHeight}" ${estimate>availableW*.85?`textLength="${Math.min(estimate,availableW)}" lengthAdjust="spacingAndGlyphs"`:''}>${escape(line)}</tspan>`;}).join('')}</text>`);
 }
 const bounds={x:minX,y:minY,width,height};
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${width} ${height}" width="${Math.ceil(width)}" height="${Math.ceil(height)}" role="img" aria-label="${escape(title)}"><title>${escape(title)}</title><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto-start-reverse" markerUnits="userSpaceOnUse"><path d="M1 1 L7 4 L1 7" fill="none" stroke="${palette.muted}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></marker></defs><rect x="${minX}" y="${minY}" width="${width}" height="${height}" rx="18" fill="${palette.paper}"/>${shapes.join('')}${edgePaths.join('')}${labels.join('')}</svg>`;
 return {svg,bounds};
}
