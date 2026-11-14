// --- Directions
// Given a string, return a new string with the reversed
// order of characters
// --- Examples
//   reverse('apple') === 'leppa'
//   reverse('hello') === 'olleh'
//   reverse('Greetings!') === '!sgniteerG'

function reverse(str: string): string | undefined {
  // solution: split the string into an array of characters, reverse the array, and join it back into a string
  // return str.split("").reverse().join("");

  // solution: iterate through each character of the string and prepend it to the reversed string
  // let reversed = "";
  // for (let character of str) {
  //   reversed = character + reversed;
  // }
  // return reversed;

  // solution: use reduce to build the reversed string
  return str.split("").reduce((reversed, character) => {
    debugger;
    return character + reversed;
  }, "");
}

reverse("apple");

export = reverse;
