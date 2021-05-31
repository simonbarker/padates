export type DateString = string;

const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const MS_IN_4_YEARS = 126144000000;

const TIME_CONVERSIONS: { [key: string]: number } = {
  y: 31536000000,
  w: 604800000,
  d: 86400000,
  h: 3600000,
  m: 60000,
  s: 1000,
};

export const parse = (datestring: DateString): Date => {
  if (!datestring.length) {
    throw new Error('Empty string was passed in');
  }

  // make sure string contains only valid characters 'now' dMyhmsw -+/
  if (datestring.match(/^[now\d-\+\/dMyhmsw]*$/) === null) {
    throw new Error('Invalid string was passed in');
  }

  const dateMutations = [...datestring.matchAll(/[-|\+]\d*[dMyhmsw]/g)].map(
    ([mutation]) => mutation
  );
  const [rounding] = [...(datestring.match(/\/[dMyhmsw]$/) || ['/s'])];

  const milliSecondsToOffsetBy = dateMutations.reduce((acc, mutation) => {
    return (acc += convertDateMutationToSeconds(mutation));
  }, 0);

  let offsetDate = new Date(new Date().getTime() + milliSecondsToOffsetBy);

  return roundDate(offsetDate, rounding);
};

export const stringify = (date: Date): DateString => {
  const diff = date.getTime() - new Date().getTime();

  let responseString: DateString = 'now';

  if (!diff) {
    return responseString;
  }

  responseString += convertMsToUnits(diff);

  if (diff < 0) {
    return responseString.replace(/\+/g, '-');
  }

  return responseString;
};

const convertMsToUnits = (ms: number): string => {
  const units = ['y', 'M', 'w', 'd', 'h', 'm', 's'];
  const direction = ms > 0 ? '+' : '-';
  let outputString = '';
  let remainingTime = Math.abs(ms);

  units.forEach(unit => {
    let unitsWorthOfTime = 0;
    let remainder = 0;

    if (unit === 'M') {
      // do we have at least the smallest months worths of time?
      if (remainingTime < Math.min(...daysInMonths) * TIME_CONVERSIONS.d) {
        return;
      }

      let numberOfDays = Math.floor(remainingTime / TIME_CONVERSIONS.d);
      let monthRemainder = safeModulo(remainingTime, TIME_CONVERSIONS.d);

      // need to get the number of months from current date
      const currentMonth = new Date().getMonth();
      let monthCount = 0;
      while (numberOfDays > Math.min(...daysInMonths)) {
        if (direction === '+') {
          numberOfDays -=
            daysInMonths[safeModulo(currentMonth + monthCount, 12)];
        } else {
          numberOfDays -=
            daysInMonths[safeModulo(currentMonth - 1 - monthCount, 12)];
        }
        monthCount += 1;
      }
      unitsWorthOfTime = monthCount;

      monthRemainder += numberOfDays * TIME_CONVERSIONS.d;
      remainder = monthRemainder;
    } else {
      unitsWorthOfTime = Math.floor(remainingTime / TIME_CONVERSIONS[unit]);
      remainder = safeModulo(remainingTime, TIME_CONVERSIONS[unit]);
    }

    // do we have at least one whole unit of this time measurement?
    if (unitsWorthOfTime >= 1) {
      outputString = `${outputString}+${unitsWorthOfTime}${unit}`;
      remainingTime = remainder;
    }
  });

  return outputString;
};

const convertDateMutationToSeconds = (mutation: string): number => {
  // valid mutations will start with add/sub and end with unit, the rest is the amount
  const direction = mutation.charAt(0) === '-' ? -1 : 1;
  const unit = mutation.charAt(mutation.length - 1);
  const amount = parseInt(mutation.slice(1, -1));

  let milliSeconds = 0;

  switch (unit) {
    case 'm':
      milliSeconds = amount * direction * TIME_CONVERSIONS.m;
      break;
    case 'h':
      milliSeconds = amount * direction * TIME_CONVERSIONS.h;
      break;
    case 'd':
      milliSeconds = amount * direction * TIME_CONVERSIONS.d;
      break;
    case 'w':
      milliSeconds = amount * direction * TIME_CONVERSIONS.w;
      break;
    case 'M':
      // this one is the only "not-fixed" time unit, number of seconds will be related to current month and days in preceeding / following months
      const currentMonth = new Date().getMonth();
      let monthCount = 0;
      let days = 0;
      while (monthCount < amount) {
        if (direction < 0) {
          // we care about the days in the preceding month for this offset (as extra days are behind)
          days += daysInMonths[safeModulo(currentMonth - 1 - monthCount, 12)];
        } else {
          // we care about days in this month for this offset (as extra days are ahead)
          days += daysInMonths[safeModulo(currentMonth + monthCount, 12)];
        }
        monthCount++;
      }
      milliSeconds = TIME_CONVERSIONS.d * days * direction;
      break;
    case 'y':
      milliSeconds = amount * direction * TIME_CONVERSIONS.y;
      break;
    default:
      // seconds
      milliSeconds = amount * direction * TIME_CONVERSIONS.s;
  }

  // how many leap years do we cross?
  const leapYears = Math.floor(milliSeconds / MS_IN_4_YEARS);
  milliSeconds += leapYears * TIME_CONVERSIONS.d * direction;

  return milliSeconds;
};

const roundDate = (d: Date, unit: string): Date => {
  // This function is horrible, must be a better way
  const y = d.getFullYear();
  const M =
    `${d.getUTCMonth()}`.length == 1
      ? `0${d.getUTCMonth() + 1}`
      : `${d.getUTCMonth() + 1}`;
  const D =
    `${d.getUTCDate()}`.length == 1
      ? `0${d.getUTCDate()}`
      : `${d.getUTCDate()}`;
  const h =
    `${d.getUTCHours()}`.length == 1
      ? `0${d.getUTCHours()}`
      : `${d.getUTCHours()}`;
  const m =
    `${d.getUTCMinutes()}`.length == 1
      ? `0${d.getUTCMinutes()}`
      : `${d.getUTCMinutes()}`;

  switch (unit) {
    case '/m':
      return new Date(Date.parse(`${y}-${M}-${D}T${h}:${m}:00`));
    case '/h':
      return new Date(Date.parse(`${y}-${M}-${D}T${h}:00:00`));
    case '/d':
      return new Date(Date.parse(`${y}-${M}-${D}T00:00:00`));
    case '/M':
      return new Date(Date.parse(`${y}-${M}-01T00:00:00`));
    case '/y':
      return new Date(Date.parse(`${y}-01-01T00:00:00`));
    default:
      return d;
  }
};

// deal with JS's negative modulo behaviour
const safeModulo = (operand: number, modulator: number): number => {
  return ((operand % modulator) + modulator) % modulator;
};
