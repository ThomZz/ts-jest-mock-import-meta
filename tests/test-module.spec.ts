import { getEnv, getFlag, getNumber, getUrl } from './test-module';

describe('getUrl', () => {
  it('Should return replaced path.', () => {
    expect(getUrl().toString()).toEqual('https://www.mydummyurl.com/');
  });
});

describe('getEnv', () => {
  it('Should return replaced env.', () => {
    expect(getEnv()).toMatchObject({ DEV: true });
  });
});

describe('getFlag', () => {
  it('Should return replaced flag.', () => {
    expect(getFlag()).toBe(false);
  });
});

describe('getNumber', () => {
  it('Should return replaced number.', () => {
    expect(getNumber()).toEqual(333);
  });
});
