'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2022-01-30T17:01:17.194Z',
    '2022-01-31T23:36:17.929Z',
    '2022-02-01T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions
const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);
  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    //const day = `${date.getDate()}`.padStart(2, 0);
    //const month = `${date.getMonth() + 1}`.padStart(2, 0);
    //const year = date.getFullYear();
    //return `${month}/${day}/${year}`;
    return new Intl.DateTimeFormat(locale).format(date);
  }
};
const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);
    const formattedMov = formatCur(mov, acc.locale, acc.currency);
    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__dates">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(out, acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);

  //add light grey to every other row
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    if (i % 2 === 0) row.style.backgroundColor = 'lightgrey';
  });
};

///////////////////////////////////////
// Event handlers
let currentAccount;

// FAKE ALWAYS LOGGED IN
/*
currentAccount = account1;
updateUI(currentAccount);
containerApp.style.opacity = 100;*/

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    //create current date
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric', //can also use '2-digit', 'short', 'narrow'
      //weekday: 'long',
    };
    const locale = navigator.language; //gets the info from the users browers. Can replace 'en-US' etc.

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);
    /* all the below replaced by Intl above using ISO langauge code table
    const day = `${now.getDate()}`.padStart(2, 0);
    const month = `${now.getMonth() + 1}`.padStart(2, 0);
    const year = now.getFullYear();
    const hour = `${now.getHours()}`.padStart(2, 0);
    const min = `${now.getMinutes()}`.padStart(2, 0);
    labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;
    // day/month/year
*/ ////////////

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    //add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());
    // Update UI
    updateUI(currentAccount);
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.ceil(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // Add movement
    currentAccount.movements.push(amount);

    //add loan date
    currentAccount.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
/*
console.log(23 === 23.0); //one data type for all numbers. stored in binary
//base 10: 0 to 9
//binary base 2: 0,1 This creates issues like below
console.log(0.1 + 0.2); //returns 0.300000000000000004
console.log(0.1 + 0.2 === 0.3); //returns false
//converting str to number
console.log(Number('23')); //one way of doing it
console.log(+'23'); //an easier way of doing it

// parsing
console.log(Number.parseInt('30px', 10)); //will pull numbers out of a str if they are at the beginning. Accepts two arguments. The second is the radix which is the base number. We're using 10 but it could be 2 for binary.
console.log(Number.parseInt('e23')); //returns NaN

console.log(Number.parseFloat('2.5rem')); //reads decimal point from a string. if I used parseInt it would just return 2.

console.log(Number.isNaN(20)); //returns true or false. This returns false
console.log(Number.isNaN('20')); //so does this.
console.log(Number.isNaN(+'20x')); //returns true
console.log(Number.isNaN(23 / 0)); //returns false since this is infinity which doesn't maek sense. See Below.
//isFinite is a better way to determine if it is a number.
console.log(Number.isFinite(20)); //returns true
console.log(Number.isFinite('20')); //returns false
console.log(Number.isFinite(23 / 0)); //returns false
*/
/*
// MATH AND ROUNDING
console.log(Math.sqrt(25));
console.log(25 ** (1 / 2));

console.log(Math.max(5, 18, 23, 11, 2));
console.log(Math.max(5, 18, '23', 11, 2)); //It will do type coersion
console.log(Math.max(5, 18, '23px', 11, 2)); // but not parsing, this will return NaN.

console.log(Math.min(5, 18, 23, 11, 2));
console.log(Math.PI * Number.parseFloat('10px') ** 2); //area of a circle

console.log(Math.trunc(Math.random() * 6) + 1); //creates a random dice roll

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min) + 1) + min; //creates a random int between max and min

console.log(randomInt(10, 20));

// Rounding integers
console.log(Math.trunc(23.3)); //removes any decimal part. returns 23
console.log(Math.round(23.9)); //rounds to the nearest integer. returns 24

console.log(Math.ceil(23.3)); //rounds up
console.log(Math.ceil(23.9)); //rounds up

console.log(Math.floor(23.3)); //rounds down
console.log(Math.floor(23.9)); //rounds down

console.log(Math.trunc(-23.3)); //for negative numbers, trunc just cuts off the number at the decimal point.
console.log(Math.floor(-23.3)); //for floor it rounds down to -24.

//Rounding decimals
console.log((2.7).toFixed(0)); //returns the string "3"
console.log((2.7).toFixed(3)); //returns the string "2.700" it adds to the decimal side until it gets to 3
console.log((2.345).toFixed(2)); //returns the string "2.35"
console.log(+(2.345).toFixed(2)); //returns the num 2.35. makes sure + is outside the num brackets
*/
/*
// THE REMAINDER OPERATOR

console.log(5 % 2); //returns the remainder which is 1 in this case. 5 = 2 * 2 +1
console.log(8 * 3); //returns 2 | 8 = 2*3 +2

//checking even or odd
console.log(6 % 2); //returns 0 which is even

const isEven = num => num % 2 === 0;
console.log(isEven(8));
console.log(isEven(23));
console.log(isEven(18));

labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    if (i % 2 === 0) row.style.backgroundColor = 'lightgrey';
  });
});
*/

/*
//Numeric seperators
const diameter = 287_460_000_000; //won't contain the underscore when logged to the console but makes it easier to read in the code.
console.log(diameter);

const priceCents = 345_99;
console.log(priceCents);

const transferFee1 = 15_00;
const trasferFee2 = 1_500; //both are 1500

const PI = 3.1415; //can't place the undersore at the beginning or end or before or after a period.

//console.log(Number('230_000')); will return NaN
*/

/*
// Working with BigInt
//Due to the 64-bit limit, this is the largest number JS can safely represent
console.log(2 ** 53 - 1);
console.log(Number.MAX_SAFE_INTEGER); //same as above
//You may be able to get a number larger but it will start being innacurate
console.log(298457298674532984732894723985623985673984627398643297846n);
//n changes it to a BigInt number
console.log(BigInt(298457298674532984732894723985623985673984627398643297846));
console.log(1000000n * 12321412n);
//console.log(Math.sqrt(16n)); throws an error

const huge = 298375498325623896n;
const num = 23;
//will throw an error, can't mix types console.log(huge * num);
console.log(huge * BigInt(num)); //this will work

console.log(20n > 15); //true
console.log(20n === 20); //false
console.log(typeof 20n);

console.log(huge + ' is a huuuuuuuuge number!!!!');
console.log(11n / 3n); //will cutoff the decimal part
console.log(11 / 3);
*/

// Creating dates
/*
const now = new Date();
console.log(now); //logs the date of today

console.log(new Date('Wed Feb 02 2022 12:27:45')); //will fill out the rest
console.log(new Date('December 24, 2021'));

console.log(new Date(account1.movementsDates[0]));
console.log(new Date(2037, 10, 19, 15, 23, 5)); //month is zero based so 10 is actually November and so on
console.log(new Date(2037, 10, 35)); //returns december 5th

console.log(new Date(0)); //returns the initial unix date which is 12/31/1969
*/
/*
const future = new Date(2037, 10, 19, 15, 23);
console.log(future);
console.log(future.getFullYear());
console.log(future.getMonth()); //remember it is zero based
console.log(future.getDate()); //returns day
console.log(future.getDay()); //retursn day of the week 0 is sun
console.log(future.getHours());
console.log(future.getMinutes());
console.log(future.getSeconds());
console.log(future.toISOString()); //covnerts date into a string
console.log(future.getTime()); //milliseconds that have passed since then initial unix date and time
console.log(new Date(2142274980000)); //returns the same date
console.log(Date.now()); //gets current time stamp

future.setFullYear(2040); //set works on all the ones above

console.log(future);
*/

/*
//operations with dates
const future = new Date(2037, 10, 19, 15, 23);
console.log(+future);

const calcDaysPassed = (date1, date2) =>
  Math.abs(date2 - date1) / (1000 * 60 * 60 * 24); //convering milliseconds to days. Math.abs takes the absolute value so you can pass the dates into the function in any order and it still makes sense
const days1 = calcDaysPassed(new Date(2037, 3, 14), new Date(2037, 3, 24));
console.log(days1);
*/
/*
//Internatioanlizing Numbers
const num = 3884764.23;
const options = {
  style: 'unit', //unit percent or currency (have to define currency below ,b/c it is not defined by the locale)
  unit: 'mile-per-hour',
  //currency: 'EUR,
  //useGrouping: false, just prints the number ie 1200 vice 1,200
};
console.log('US', new Intl.NumberFormat('en-US').format(num));
console.log('US', new Intl.NumberFormat('en-US', options).format(num));
console.log('Germay', new Intl.NumberFormat('de-DE').format(num));
console.log('Germay', new Intl.NumberFormat('de-DE', options).format(num));
console.log('Syria', new Intl.NumberFormat('ar-SY').format(num));
console.log(
  'Browser',
  navigator.language,
  new Intl.NumberFormat(navigator.language).format(num)
);*/
