// --- Directions
// Implement classes Node and Linked Lists
// See 'directions' document

class Node<T = unknown, Next = never> {
  declare data: T;
  declare next: Node<T> | Next | null;
  constructor(..._args: [data: T, next?: Node<T> | Next | null]) {}
}

class LinkedList<T = unknown> {
  declare head: Node<T> | null;
  declare insertFirst: (data: T) => void;
  declare size: () => number;
  declare getFirst: () => Node<T> | null;
  declare getLast: () => Node<T> | null | undefined;
  declare clear: () => void;
  declare removeFirst: () => void;
  declare removeLast: () => void;
  declare insertLast: (data: T) => void;
  declare getAt: (index: number) => Node<T> | null;
  declare removeAt: (index: number) => void;
  declare insertAt: (data: T, index: number) => void;
  declare forEach: (fn: (node: Node<T>, index: number) => void) => void;
  declare [Symbol.iterator]: () => Generator<Node<T>, void, unknown>;
}

export { Node, LinkedList };
