export function insertAtHead(head, data) {
  return { data, next: head };
}

export function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
  return [];
}

export function groupAnagrams(words) {
  const groups = new Map();
  for (const word of words) {
    const key = word.split('').sort().join('');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(word);
  }
  return [...groups.values()];
}

export function searchInsert(nums, target) {
  let left = 0;
  let right = nums.length;
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] < target) left = mid + 1;
    else right = mid;
  }
  return left;
}

export function binarySearch(nums, target) {
  let left = 0;
  let right = nums.length - 1;
  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}

export function topKFrequent(nums, k) {
  if (k <= 0) return [];
  const frequency = new Map();
  for (const num of nums) frequency.set(num, (frequency.get(num) ?? 0) + 1);
  const buckets = Array.from({ length: nums.length + 1 }, () => []);
  for (const [num, count] of frequency) buckets[count].push(num);
  const result = [];
  for (let count = buckets.length - 1; count >= 1; count--) {
    for (const num of buckets[count]) {
      result.push(num);
      if (result.length === k) return result;
    }
  }
  return result;
}
