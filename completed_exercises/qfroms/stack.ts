class Stack<T = unknown> {
  data: T[];
  constructor() {
    this.data = [];
  }

  push(record: T) {
    this.data.push(record);
  }

  pop() {
    return this.data.pop();
  }

  peek(): T | undefined {
    return this.data[this.data.length - 1];
  }
}

export = Stack;
