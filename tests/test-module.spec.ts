import { getEnv, getSpec, getFlag, getNumber, getUrl, getExpiration } from './test-module';

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

describe('getSpec', () => {
  it('Should return replaced spec.', () => {
    expect(getSpec()).toMatchObject({ descriptor: 'aaaaaa' });
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

describe('getExpiration', () => {
  it('Should return a value < than current time.', () => {
    expect(getExpiration()).toBeLessThan(new Date().getTime());
  });
});
