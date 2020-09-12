function padNumber(x) {
  return (x.toString().length < 2 ? `0${x}` : x).toString();
}

export default padNumber;
