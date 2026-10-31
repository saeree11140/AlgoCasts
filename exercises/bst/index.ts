// --- Directions
// 1) Implement the Node class to create
// a binary search tree.  The constructor
// should initialize values 'data', 'left',
// and 'right'.
// 2) Implement the 'insert' method for the
// Node class.  Insert should accept an argument
// 'data', then create an insert a new node
// at the appropriate location in the tree.
// 3) Implement the 'contains' method for the Node
// class.  Contains should accept a 'data' argument
// and return the Node in the tree with the same value.

class Node {
  declare data: number;
  declare left: Node | null;
  declare right: Node | null;
  constructor(..._args: [data: number]) {}
  declare insert: (data: number) => void;
  declare contains: (data: number) => Node | null;
}

export = Node;
