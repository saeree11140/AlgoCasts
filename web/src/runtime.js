// Self-contained: serialized into an isolated worker, never evaluated in the app.
export async function executeSuite(payload) {
  const tests = [], logs = [], restores = [];
  // console output goes to the running test's own list; outside a test it goes to `logs`.
  let sink = logs, logCount = 0;
  const root = { name: '', before: [], after: [], parent: null };
  let scope = root;
  const describe = (name, fn) => { const prev = scope; scope = { name, before: [], after: [], parent: prev }; try { fn(); } finally { scope = prev; } };
  const register = (name, fn, skip = false) => tests.push({ name, fn, scope, skip });
  const test = (name, fn) => register(name, fn);
  test.skip = (name, fn) => register(name, fn, true);
  const beforeEach = fn => scope.before.push(fn);
  const afterEach = fn => scope.after.push(fn);
  const format = value => {
    const seen = new WeakSet();
    try { return (typeof value === 'string' ? value : JSON.stringify(value, (_,v) => {
      if(typeof v==='bigint')return String(v)+'n';
      if(typeof v==='object'&&v!==null){if(seen.has(v))return '[Circular]';seen.add(v);} return v;
    }) ?? String(value)).slice(0,1500); } catch { return String(value).slice(0,1500); }
  };
  const equal = (a,b,seen = new WeakMap()) => {
    if(Object.is(a,b))return true;
    if(!a||!b||typeof a!=='object'||typeof b!=='object')return false;
    if(Array.isArray(a)!==Array.isArray(b))return false;
    if(seen.get(a)===b)return true;seen.set(a,b);
    const ak=Object.keys(a),bk=Object.keys(b);
    return ak.length===bk.length && ak.every(k=>Object.prototype.hasOwnProperty.call(b,k)&&equal(a[k],b[k],seen));
  };
  const expect = (actual, negative = false) => {
    const check = (ok, expected) => { if(negative?ok:!ok) throw new Error(`Expected${negative?' not':''}: ${format(expected)}\nActual: ${format(actual)}`); };
    return {
      get not(){return expect(actual,!negative);},
      toEqual:expected=>check(equal(actual,expected),expected),
      toBe:expected=>check(Object.is(actual,expected),expected),
      toBeDefined:()=>check(actual!==undefined,'defined'),
      toBeUndefined:()=>check(actual===undefined,undefined),
      toBeTruthy:()=>check(Boolean(actual),true),
      toBeFalsy:()=>check(!actual,false),
      toThrow:expected=>{let err;try{actual();}catch(e){err=e;}check(Boolean(err)&&(!expected||String(err).includes(String(expected))),expected||'an error');},
      get rejects(){return {toThrow:async()=>{let thrown=false;try{await actual();}catch{thrown=true;}check(thrown,'promise rejection');}};},
    };
  };
  const fn = (implementation = ()=>{}) => {
    const wrapped = function(...args){wrapped.mock.calls.push(args);return implementation.apply(this,args);};
    wrapped.mock={calls:[],callCount:()=>wrapped.mock.calls.length};
    wrapped.mockImplementation = replacement => {implementation=replacement;return wrapped;};
    wrapped.mockRestore = ()=>{};
    return wrapped;
  };
  const spyOn=(object,key)=>{const original=object[key];const spy=fn(function(...args){return original.apply(this,args);});object[key]=spy;spy.mockRestore=()=>{object[key]=original;};restores.push(spy.mockRestore);return spy;};
  const jest={fn,spyOn};
  globalThis.fetch=async()=>{throw new Error('Network disabled: ใช้ได้เฉพาะ Mock API ของโจทย์');};
  const originalConsole = globalThis.console;
  globalThis.console={...originalConsole};
  for(const level of ['log','warn','error','info','debug']) globalThis.console[level]=(...args)=>{if(logCount<100){logCount++;sink.push(args.map(format).join(' ').slice(0,2000));}};
  const assert={
    equal:(a,b)=>expect(a).toBe(b), strictEqual:(a,b)=>expect(a).toBe(b),
    deepEqual:(a,b)=>expect(a).toEqual(b), deepStrictEqual:(a,b)=>expect(a).toEqual(b),
    ok:a=>expect(a).toBeTruthy(),
    rejects:async(p,pattern)=>{let caught;try{await (typeof p==='function'?p():p);}catch(e){caught=e;}if(!caught||!pattern.test(String(caught)))throw new Error(`Expected rejection ${pattern}; actual ${caught}`);},
  };
  const fakeApi={
    async startChocolateApi(options={}) {
      let requests=0;
      const seed=options.seed??[
        {name:'Dark 70',category:'dark',cacaoPercent:70}, {name:'Milk Classic',category:'milk',cacaoPercent:35},
        {name:'White Vanilla',category:'white',cacaoPercent:0}, {name:'Ruby Berry',category:'ruby',cacaoPercent:47},
        {name:'Dark 100 Pure',category:'dark',cacaoPercent:100},
      ];
      const items=seed.map((item,i)=>({...item,id:i+1}));
      globalThis.fetch=async input=>{
        const url=new URL(String(input));
        if(url.origin!=='https://practice.invalid'||url.pathname!=='/api/chocolate-types')throw new Error('Network disabled: unknown fixture URL');
        requests++;
        let status=200;
        const minCacao=Number(url.searchParams.get('minCacao')||0),page=Number(url.searchParams.get('page')||1),pageSize=Number(url.searchParams.get('pageSize')||10);
        if(options.failListRequests?.includes(requests))status=503;
        else if(!Number.isInteger(minCacao)||minCacao<0||minCacao>100||!Number.isInteger(page)||page<1||!Number.isInteger(pageSize)||pageSize<1||pageSize>50)status=400;
        const filtered=items.filter(item=>item.cacaoPercent>=minCacao);
        const body=status===200?{data:filtered.slice((page-1)*pageSize,page*pageSize),meta:{page,pageSize,total:filtered.length,totalPages:Math.ceil(filtered.length/pageSize)}}:{error:{message:'Fixture status '+status}};
        return {ok:status>=200&&status<300,status,headers:{get:k=>k.toLowerCase()==='retry-after'?'0':null},json:async()=>body,text:async()=>JSON.stringify(body)};
      };
      return {server:{},baseUrl:'https://practice.invalid'};
    },
    async stopChocolateApi() {},
  };
  const nodeTest=Object.assign(test,{describe,it:test,beforeEach,afterEach});
  const cache={};
  const load=id=>{
    const normalized=id.replace(/\.(?:ts|mjs|js)$/,'');
    if(normalized==='node:assert/strict')return assert;
    if(normalized==='node:test')return nodeTest;
    if(normalized==='../api/index')return fakeApi;
    if(cache[normalized])return cache[normalized].exports;
    if(!Object.prototype.hasOwnProperty.call(payload.modules,normalized))throw new Error('Unsupported import: '+id);
    const module={exports:{}};cache[normalized]=module;
    new Function('require','module','exports','test','it','describe','expect','jest','beforeEach','afterEach',payload.modules[normalized])(load,module,module.exports,test,test,describe,expect,jest,beforeEach,afterEach);
    return module.exports;
  };
  try { load('./test'); } catch(error) { globalThis.console=originalConsole;return {tests:[],logs,error:String(error).slice(0,3000)}; }
  const results=[];
  for(const item of tests.slice(0,payload.sample?3:tests.length)) {
    if(item.skip){results.push({name:item.name,status:'skip'});continue;}
    const scopes=[];for(let s=item.scope;s;s=s.parent)scopes.unshift(s);
    let failure;
    const testLogs=[];sink=testLogs;
    const start=performance.now();
    try {
      for(const s of scopes)for(const before of s.before)await before();
      await item.fn({mock:{method:spyOn}});
    } catch(error) {failure=String(error).slice(0,3000);}
    finally {
      for(const s of scopes.slice().reverse())for(const after of s.after){try{await after();}catch(error){failure??=String(error);}}
      for(const restore of restores.splice(0).reverse())restore();
      sink=logs;
    }
    results.push({name:scopes.map(s=>s.name).filter(Boolean).concat(item.name).join(' › '),status:failure?'fail':'pass',error:failure,duration:Math.round((performance.now()-start)*100)/100,logs:testLogs});
  }
  globalThis.console=originalConsole;
  return {tests:results,logs};
}
