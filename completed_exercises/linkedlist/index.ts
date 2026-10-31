// --- Directions
// Implement classes Node and Linked Lists
// See 'directions' document

class Node<T = unknown, Next = never> {
  data: T;
  next: Node<T> | Next | null;
  constructor(data: T, next: Node<T> | Next | null = null) {
    this.data = data;
    this.next = next;
  }
}

class LinkedList<T = unknown> {
  head: Node<T> | null;
  constructor() {
    this.head = null;
  }

  insertFirst(data: T) {
    this.head = new Node<T>(data, this.head);
  }

  size() {
    let counter = 0;
    let node: Node<T> | null = this.head;

    while (node) {
      counter++;
      node = node.next;
    }

    return counter;
  }

  getFirst() {
    return this.head;
  }

  getLast() {
    if (!this.head) {
      return null;
    }

    let node: Node<T> | null = this.head;
    while (node) {
      if (!node.next) {
        return node;
      }
      node = node.next;
    }
  }

  clear() {
    this.head = null;
  }

  removeFirst() {
    if (!this.head) {
      return;
    }

    this.head = this.head.next;
  }

  removeLast() {
    if (!this.head) {
      return;
    }

    if (!this.head.next) {
      this.head = null;
      return;
    }

    let previous = this.head;
    let node = this.head.next;
    while (node.next) {
      previous = node;
      node = node.next;
    }
    previous.next = null;
  }

  insertLast(data: T) {
    const last = this.getLast();

    if (last) {
      // There are some existing nodes in our chain
      last.next = new Node<T>(data);
    } else {
      // The chain is empty!
      this.head = new Node<T>(data);
    }
  }

  getAt(index: number) {
    let counter = 0;
    let node: Node<T> | null = this.head;
    while (node) {
      if (counter === index) {
        return node;
      }

      counter++;
      node = node.next;
    }
    return null;
  }

  removeAt(index: number) {
    if (!this.head) {
      return;
    }

    if (index === 0) {
      this.head = this.head.next;
      return;
    }

    const previous = this.getAt(index - 1);
    if (!previous || !previous.next) {
      return;
    }
    previous.next = previous.next.next;
  }

  insertAt(data: T, index: number) {
    if (!this.head) {
      this.head = new Node<T>(data);
      return;
    }

    if (index === 0) {
      this.head = new Node<T>(data, this.head);
      return;
    }

    const previous = (this.getAt(index - 1) || this.getLast())!;
    const node = new Node<T>(data, previous.next);
    previous.next = node;
  }

  forEach(fn: (node: Node<T>, index: number) => void) {
    let node: Node<T> | null = this.head;
    let counter = 0;
    while (node) {
      fn(node, counter);
      node = node.next;
      counter++;
    }
  }

  *[Symbol.iterator]() {
    let node: Node<T> | null = this.head;
    while (node) {
      yield node;
      node = node.next;
    }
  }
}

export { Node, LinkedList };
