import {EditorView,basicSetup} from 'codemirror';
import {Prec,type Extension} from '@codemirror/state';
import {HighlightStyle,syntaxHighlighting} from '@codemirror/language';
import {tags as t} from '@lezer/highlight';
import {javascript} from '@codemirror/lang-javascript';
import {oneDark} from '@codemirror/theme-one-dark';

// One Dark's comment grey (#7d8799) and coral (#e06c75) fall below 4.5:1 on its own background.
const readableOneDark=Prec.highest(syntaxHighlighting(HighlightStyle.define([
 {tag:[t.meta,t.comment],color:'#9aa3b5',fontStyle:'italic'},
 {tag:[t.name,t.deleted,t.character,t.propertyName,t.macroName],color:'#e8838b'},
])));

export function mountEditor(parent:HTMLElement,code:string,onChange:(code:string)=>void,options?:{language:Extension;label:string}) {
 return new EditorView({parent,doc:code,extensions:[basicSetup,options?.language??javascript({typescript:true}),oneDark,readableOneDark,
   EditorView.contentAttributes.of({'aria-label':options?.label??'TypeScript code editor','spellcheck':'false'}),
   EditorView.lineWrapping,
   EditorView.updateListener.of(update=>{if(update.docChanged)onChange(update.state.doc.toString());}),
   Prec.highest(EditorView.theme({'&':{height:'100%',fontSize:'16px'},'.cm-scroller':{overflow:'auto',fontFamily:'ui-monospace, SFMono-Regular, Menlo, monospace'},'.cm-content':{padding:'18px 14px 18px 0'},'.cm-gutters':{paddingRight:'8px',color:'#9aa3b5'}})),
 ]});
}
