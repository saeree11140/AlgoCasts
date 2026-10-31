class Node {
  data: number;
  left: Node | null;
  right: Node | null;
  constructor(data: number) {
    this.data = data;
    this.left = null;
    this.right = null;
  }

  insert(data: number) {
    if (data < this.data && this.left) {
      this.left.insert(data);
    } else if (data < this.data) {
      this.left = new Node(data);
    } else if (data > this.data && this.right) {
      this.right.insert(data);
    } else if (data > this.data) {
      this.right = new Node(data);
    }
  }
}

export = Node;
