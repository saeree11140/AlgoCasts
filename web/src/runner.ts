import {executeSuite} from './runtime.js';
import type {Detail,RunResult} from './types';
let active: (()=>void)|undefined;
export function cancelRun() {active?.();}
export function runCode(detail:Detail,code:string,sample:boolean):Promise<RunResult> {
 cancelRun();
 return new Promise(resolve=>{
  let finished=false;
  let frame:HTMLIFrameElement|undefined;
  let timeout:ReturnType<typeof setTimeout>|undefined;
  const finish=(result:RunResult)=>{
   if(finished)return;finished=true;
   clearTimeout(timeout);removeEventListener('message',onMessage);frame?.remove();
   if(active===cancel)active=undefined;
   resolve(result);
  };
  const cancel=()=>finish({tests:[],logs:[],error:'ยกเลิกการทดสอบแล้ว'});
  const onMessage=(event:MessageEvent)=>{
   if(!frame||event.source!==frame.contentWindow)return;
   if(event.data?.type==='ready')frame.contentWindow!.postMessage({type:'run',program},'*');
   if(event.data?.type==='result'){
    const data=event.data.result;
    if(!data||!Array.isArray(data.tests)||!Array.isArray(data.logs))return finish({tests:[],logs:[],error:'ผลทดสอบไม่ถูกต้อง'});
    finish({tests:data.tests.slice(0,300).map((t:any)=>({name:String(t.name).slice(0,500),status:['pass','fail','skip'].includes(t.status)?t.status:'fail',error:t.error?String(t.error).slice(0,3000):undefined,duration:Number(t.duration)||0})),logs:data.logs.slice(0,100).map((s:unknown)=>String(s).slice(0,2000)),error:data.error?String(data.error).slice(0,3000):undefined});
   }
  };
  let program='';
  active=cancel;
  if(code.length>50000){finish({tests:[],logs:[],error:'โค้ดยาวเกิน 50,000 ตัวอักษร'});return;}
  void (async()=>{
   const ts=await import('typescript');
   if(finished)return;
   const modules:Record<string,string>={};
   for(const [name,source] of Object.entries({...detail.modules,'./index':code})){
    const result=ts.transpileModule(source,{reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}});
    const errors=result.diagnostics?.filter(d=>d.category===ts.DiagnosticCategory.Error);
    if(errors?.length){finish({tests:[],logs:[],error:errors.map(d=>`${name}: ${ts.flattenDiagnosticMessageText(d.messageText,' ')}${d.file&&d.start!==undefined?' (line '+(d.file.getLineAndCharacterOfPosition(d.start).line+1)+')':''}`).join('\n')});return;}
    modules[name]=result.outputText;
   }
   program=`(${executeSuite.toString()})(${JSON.stringify({modules,sample})}).then(result=>postMessage(result)).catch(error=>postMessage({tests:[],logs:[],error:String(error)}));`;
   if(finished)return;
   frame=document.createElement('iframe');frame.hidden=true;frame.title='Isolated TypeScript runner';frame.setAttribute('sandbox','allow-scripts');frame.src='/sandbox.html';
   timeout=setTimeout(()=>finish({tests:[],logs:[],error:'Time Limit Exceeded — เกิน 8 วินาที ตรวจ loop หรือ recursion'}),8000);
   addEventListener('message',onMessage);document.body.append(frame);
  })().catch(error=>finish({tests:[],logs:[],error:String(error)}));
 });
}
