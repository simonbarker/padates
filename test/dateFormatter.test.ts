import { parse, stringify } from '../src/dateFormatter';

import MockDate from 'mockdate';

describe('date parser', () => {
  beforeEach(() => {
    MockDate.set(1621951447000);
  });

  it('it should throw, given that an empty string was passed', () => {
    expect(() => {
      parse('');
    }).toThrow('Empty string was passed in');
  });

  it('it should throw, given that an invalid string was passed', () => {
    expect(() => {
      parse('asfd');
    }).toThrow('Invalid string was passed in');
  });

  it('it should throw, given that an invalid string was passed', () => {
    expect(() => {
      parse('now-1t');
    }).toThrow('Invalid string was passed in');
  });

  it('it should return now as a date given that it is passed now as a string', () => {
    expect(parse('now')).toEqual(Date());
  });

  it('it should return now minus 10 months given the string `now-10M/d`, rounded to the nearest day', () => {
    expect(parse('now-10M/d').toUTCString()).toEqual(
      'Sat, 25 Jul 2020 23:00:00 GMT'
    );
  });

  it('it should return now plus 10 months given the string `now+10M/d`, rounded to the nearest day', () => {
    expect(parse('now+10M/d').toUTCString()).toEqual(
      'Fri, 25 Mar 2022 00:00:00 GMT'
    );
  });

  it('it should return now plus 20 months given the string `now+20M/y`, rounded to the nearest year', () => {
    expect(parse('now+20M/y').toUTCString()).toEqual(
      'Sun, 01 Jan 2023 00:00:00 GMT'
    );
  });
});

describe('date stringify', () => {
  beforeEach(() => {
    MockDate.set(1621951447000);
  });

  it('it should return `now` as a string given that it is passed now a datetime', () => {
    expect(stringify(new Date())).toEqual('now');
  });

  it('it should return `now-1y5m25d...` as a string', () => {
    expect(stringify(new Date('2020-01-01'))).toEqual(
      'now-1y-4M-3w-4d-14h-4m-7s'
    );
  });

  it('it should return `now-1y5m25d...` as a string', () => {
    expect(stringify(new Date('2023-01-01'))).toEqual(
      'now+1y+7M+6d+9h+55m+53s'
    );
  });
});
