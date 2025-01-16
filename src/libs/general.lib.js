const generateRandomInt = (min = 0, max = 2147483647) => {
  min = parseInt(min, 10);
  max = parseInt(max, 10);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

module.exports = {
  generateRandomInt,
};
