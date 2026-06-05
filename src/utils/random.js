export const randomToken = (length = 9) => {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const values = new Uint32Array(length);
  globalThis.crypto.getRandomValues(values);

  return Array.from(values, value => alphabet[value % alphabet.length]).join('');
};

export const randomNumberBetween = (min, max) => {
  const range = max - min + 1;
  const values = new Uint32Array(1);
  globalThis.crypto.getRandomValues(values);

  return min + (values[0] % range);
};
