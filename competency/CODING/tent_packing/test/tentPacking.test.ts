import { minTentPacking } from "../src/tentPacking";

describe("Tent Packing Problem (Full Test Set)", () => {
  it("Case 1: 10, [2,5,6] => 2, [5,5]", () => {
    expect(minTentPacking(10, [2, 5, 6])).toEqual({ count: 2, sizes: [5, 5] });
  });
  it("Case 2: 9, [5,6] => -1", () => {
    expect(minTentPacking(9, [5, 6])).toBe(-1);
  });
  it("Case 3: 11, [5,6] => 2, [6,5]", () => {
    expect(minTentPacking(11, [5, 6])).toEqual({ count: 2, sizes: [6, 5] });
  });
  it("Case 4: 10, [6,2,5] => 2, [5,5]", () => {
    expect(minTentPacking(10, [6, 2, 5])).toEqual({ count: 2, sizes: [5, 5] });
  });
  it("Case 5: 10, [2,5,5,5,6,6] => 2, [5,5]", () => {
    expect(minTentPacking(10, [2, 5, 5, 5, 6, 6])).toEqual({
      count: 2,
      sizes: [5, 5],
    });
  });
  it("Case 6: 8, [3,5,8] => 1, [8]", () => {
    expect(minTentPacking(8, [3, 5, 8])).toEqual({ count: 1, sizes: [8] });
  });
  it("Case 7: 8, [2,3,5] => 2, [5,3]", () => {
    expect(minTentPacking(8, [2, 3, 5])).toEqual({ count: 2, sizes: [5, 3] });
  });
  it("Case 8: 1, [2,3,4] => -1", () => {
    expect(minTentPacking(1, [2, 3, 4])).toBe(-1);
  });
  it("Case 9: 4, [1,3,5] => 2, [3,1]", () => {
    expect(minTentPacking(4, [1, 3, 5])).toEqual({ count: 2, sizes: [3, 1] });
  });
  it("Case 10: 14, [4,6,8] => 2, [8,6]", () => {
    expect(minTentPacking(14, [4, 6, 8])).toEqual({ count: 2, sizes: [8, 6] });
  });
});
