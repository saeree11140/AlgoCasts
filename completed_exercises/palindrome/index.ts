// --- Directions
// Given a string s, return true if it is a palindrome, or false otherwise.
// A phrase is a palindrome if, after converting all uppercase letters to
// lowercase and removing all non-alphanumeric characters (keep only a-z
// and 0-9), it reads the same forward and backward.
// A string that is empty after this cleanup counts as a palindrome.
// --- Example Test Cases
// Test Case 1
//   Input: isPalindrome("A man, a plan, a canal: Panama")
//   Expected: true
// Test Case 2
//   Input: isPalindrome("race a car")
//   Expected: false
// Test Case 3
//   Input: isPalindrome(" ")
//   Expected: true

// Two pointers: skip characters that are not letters or digits, then compare
// the remaining characters case-insensitively from both ends.
function isPalindrome(s: string): boolean {
  const isAlphanumeric = (char: string) => /[a-z0-9]/i.test(char);
  let left = 0;
  let right = s.length - 1;

  while (left < right) {
    if (!isAlphanumeric(s[left])) {
      left++;
    } else if (!isAlphanumeric(s[right])) {
      right--;
    } else {
      if (s[left].toLowerCase() !== s[right].toLowerCase()) return false;
      left++;
      right--;
    }
  }

  return true;
}

export = isPalindrome;

// function isPalindrome(s: string): boolean {
//   const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '');
//   return cleaned === cleaned.split('').reverse().join('');
// }
