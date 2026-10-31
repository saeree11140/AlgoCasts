// --- Directions
// Implement a 'peek' method in this Queue class.
// Peek should return the last element (the next
// one to be returned) from the queue *without*
// removing it.

class Queue<T = unknown> {
  data: T[];
  declare peek: () => T | undefined;

  constructor() {
    this.data = [];
  }

  add(record: T) {
    this.data.unshift(record);
  }

  remove() {
    return this.data.pop();
  }
}

export = Queue;
