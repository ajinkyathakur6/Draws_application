function nextPowerOf2(n) {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

// Standard seed positions for 32, 16, 8, 64
const seedMaps = {
  8:  [0,7,3,4],
  16: [0,15,7,8,3,12,4,11],
  32: [0,31,15,16,7,24,8,23,3,28,12,19,4,27,11,20],
  64: [0,63,31,32,15,48,16,47,7,56,24,39,8,55,23,40]
};

module.exports = { nextPowerOf2, seedMaps };
