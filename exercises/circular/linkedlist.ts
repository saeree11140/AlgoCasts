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
  constructor(values: T[] = []) {
    this.head = null;

    for (let value of values) {
      this.insertLast(value);
    }
  }

  clear() {
    this.head = null;
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

  getAt(index: number) {
    if (!this.head) {
      return null;
    }

    let counter = 0;
    let node: Node<T> | null = this.head;
    while (node) {
      if (counter === index) {
        return node;
      }
      node = node.next;
      counter++;
    }
    return null;
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

    let counter = 1;
    let previous = this.head;
    let node = this.head.next;
    while (node) {
      if (counter === index) {
        previous.next = new Node<T>(data, node);
        return;
      }
      previous = node;
      node = node.next;
      counter++;
    }

    previous.next = new Node<T>(data, node);
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

  removeAt(index: number) {
    if (!this.head) {
      return;
    }

    let counter = 0;
    let node: Node<T> | null = this.head;
    while (node) {
      if (counter === index - 1) {
        if (node.next) {
          return (node.next = node.next.next);
        } else {
          return (node.next = null);
        }
      }
      node = node.next;
      counter++;
    }
  }

  getFirst() {
    return this.head;
  }

  insertFirst(data: T) {
    this.head = new Node<T>(data, this.getFirst());
  }

  getLast() {
    if (!this.head) {
      return null;
    }

    let node: Node<T> | null = this.head;
    while (node.next) {
      node = node.next;
    }

    return node;
  }

  insertLast(data: T) {
    const last = this.getLast();

    if (last) {
      last.next = new Node<T>(data);
      return last.next;
    } else {
      this.head = new Node<T>(data);
      return this.head;
    }
  }

  forEach(fn: (node: Node<T>) => void) {
    if (!this.head) {
      return null;
    }

    let node: Node<T> | null = this.head;
    while (node) {
      fn(node);
      node = node.next;
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
