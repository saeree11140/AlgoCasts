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
}

export = Node;
