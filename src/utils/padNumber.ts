function padNumber(x: number): string {
  return (x.toString().length < 2 ? `0${x}` : x).toString();
}

export default padNumber;
