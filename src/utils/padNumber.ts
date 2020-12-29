/**
 * Pads a number: make it two-digits by adding a zero at the beggining if needed.
 *
 * @param {number} x - The number to pad.
 * @returns string
 */
function padNumber(x: number): string {
  return (x.toString().length < 2 ? `0${x}` : x).toString();
}

export default padNumber;
