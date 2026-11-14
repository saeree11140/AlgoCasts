import test from 'node:test';
import assert from 'node:assert/strict';
import { insertAtHead, twoSum, groupAnagrams, searchInsert, binarySearch, topKFrequent } from './solutions.mjs';

function toArray(head) {
  const result = [];
  while (head !== null) {
    result.push(head.data);
    head = head.next;
  }
  return result;
}

function normalizeGroups(groups) {
  return groups.map(group => [...group].sort()).sort((a,b) => a[0].localeCompare(b[0]));
}

test('Linked List: add new head', () => {
  const head = {data:10,next:{data:20,next:null}};
  assert.deepEqual(toArray(insertAtHead(head,5)), [5,10,20]);
});
test('Linked List: empty list', () => assert.deepEqual(toArray(insertAtHead(null,7)), [7]));
test('Two Sum: basic', () => assert.deepEqual(twoSum([2,7,11,15],9), [0,1]));
test('Two Sum: duplicate numbers at different indices', () => assert.deepEqual(twoSum([3,3],6), [0,1]));
test('Two Sum: negatives', () => assert.deepEqual(twoSum([-1,-2,-3],-5), [1,2]));
test('Group Anagrams: basic', () => assert.deepEqual(normalizeGroups(groupAnagrams(['eat','tea','tan','ate','nat','bat'])), normalizeGroups([['eat','tea','ate'],['tan','nat'],['bat']])));
test('Group Anagrams: empty strings', () => assert.deepEqual(groupAnagrams(['','']), [['','']]));
test('Search Insert: found', () => assert.equal(searchInsert([1,3,5,6],5), 2));
test('Search Insert: missing between', () => assert.equal(searchInsert([1,3,5,6],2), 1));
test('Search Insert: lower bound duplicates', () => assert.equal(searchInsert([1,3,3,8],3), 1));
test('Search Insert: empty input', () => assert.equal(searchInsert([],5), 0));
test('Binary Search: found', () => assert.equal(binarySearch([-1,0,3,5,9,12],9), 4));
test('Binary Search: not found', () => assert.equal(binarySearch([-1,0,3,5,9,12],2), -1));
test('Binary Search: empty input', () => assert.equal(binarySearch([],10), -1));
test('Top K Frequent: basic', () => assert.deepEqual(topKFrequent([1,1,1,2,2,3],2), [1,2]));
test('Top K Frequent: one highest', () => assert.deepEqual(topKFrequent([4,4,5,5,5,6],1), [5]));
test('Top K Frequent: zero requested', () => assert.deepEqual(topKFrequent([1,1,2],0), []));
