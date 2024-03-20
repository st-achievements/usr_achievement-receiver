export function arrayChunks<T>(array: readonly T[], size: number): T[][] {
  if (size <= 0) {
    return [];
  }
  const newArray: T[][] = [];
  for (let index = 0; index < array.length; index += size) {
    newArray.push(array.slice(index, index + size));
  }
  return newArray;
}
