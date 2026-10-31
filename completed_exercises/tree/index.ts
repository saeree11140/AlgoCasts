// --- Directions
// 1) Create a node class.  The constructor
// should accept an argument that gets assigned
// to the data property and initialize an
// empty array for storing children. The node
// class should have methods 'add' and 'remove'.
// 2) Create a tree class. The tree constructor
// should initialize a 'root' property to null.
// 3) Implement 'traverseBF' and 'traverseDF'
// on the tree class.  Each method should accept a
// function that gets called with each element in the tree

class Node<T = unknown> {
  data: T;
  children: Node<T>[];
  constructor(data: T) {
    this.data = data;
    this.children = [];
  }

  add(data: T) {
    this.children.push(new Node(data));
  }

  remove(data: T) {
    this.children = this.children.filter(node => {
      return node.data !== data;
    });
  }
}

class Tree<T = unknown> {
  root: Node<T> | null;
  constructor() {
    this.root = null;
  }

  traverseBF(fn: (node: Node<T>) => void) {
    const arr = [this.root!];
    while (arr.length) {
      const node = arr.shift()!;

      arr.push(...node.children);
      fn(node);
    }
  }

  traverseDF(fn: (node: Node<T>) => void) {
    const arr = [this.root!];
    while (arr.length) {
      const node = arr.shift()!;

      arr.unshift(...node.children);
      fn(node);
    }
  }
}

export { Tree, Node };
