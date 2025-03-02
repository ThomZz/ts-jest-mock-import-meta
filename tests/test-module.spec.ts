import { getEnv, getSpec, getFlag, getNumber, getUrl, getExpiration, getFileName, getResolve } from './test-module';

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

describe('getFileName', () => {
  it('Should return contextual file name, with its absolute path', () => {
    expect(getFileName()).toEqual(`${__dirname}/test-module.ts`);
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

describe('getResolve', () => {
  it('Should return absolute URL for relative path to static file.', () => {
    expect(getResolve()).toEqual('https://www.mydummyurl.com/my.jpg');
  });
});
