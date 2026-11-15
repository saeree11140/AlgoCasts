import test from 'node:test';
import assert from 'node:assert/strict';
import { renderDiagram,wrapLabel } from '../scripts/render-diagram.mjs';
const graph='<mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/><mxCell id="a" value="A long label that must wrap safely inside this box" style="rounded=0;fontSize=16;fillColor=#ffffff" vertex="1" parent="1"><mxGeometry x="200" y="200" width="160" height="65"/></mxCell><mxCell id="b" style="ellipse;fillColor=#000000" vertex="1" parent="1"><mxGeometry x="400" y="210" width="30" height="30"/></mxCell><mxCell id="t" value="Standalone heading" style="text;fontSize=24;strokeColor=none;fillColor=none" vertex="1" parent="1"><mxGeometry x="200" y="100" width="200" height="40"/></mxCell><mxCell id="edge" edge="1" source="b" parent="1"><mxGeometry relative="1"><mxPoint x="700" y="350" as="targetPoint"/></mxGeometry></mxCell></root></mxGraphModel>';
test('render preserves circle/text shapes and includes free edge endpoints in canvas',()=>{
 const {svg,bounds}=renderDiagram(graph,'Linked List');
 assert.match(svg,/<ellipse/);
 assert.doesNotMatch(svg,/NaN|undefined/);
 assert.ok(bounds.x+bounds.width>=732);
 assert.ok(bounds.y+bounds.height>=382);
 assert.ok(bounds.x>100,'trim original empty left margin');
 assert.match(svg,/data-kind="text"/);
 assert.ok((svg.match(/<tspan/g)||[]).length>=4,'wrap long labels');
});
test('wrapping respects explicit lines and long unbroken words',()=>{
 const lines=wrapLabel('One two three\nabcdefghijklmnopqrstuvwxyz',80,14);
 assert.ok(lines.length>=4);
 assert.equal(lines.map(s=>s.replace(/\s/g,'')).join(''),'Onetwothreeabcdefghijklmnopqrstuvwxyz');
});
