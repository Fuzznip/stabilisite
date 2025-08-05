export function getFileNameForTile(tile: number): string {
  if (tile === 1 || tile === 6) {
    return "/1.png";
  }

  if (tile === 12 || tile === 17) {
    return "/12.png";
  }

  if (tile === 23 || tile === 24) {
    return "/23.png";
  }

  return `/${tile}.png`;
}
