import faker from "faker";
import {
  $name,
  $nameHasFrom2To40Chars,
  $age,
  $isAdult,
  $output,
  changeName,
  changeAge,
  submit,
  saveFormBaseFx,
} from "./model";

let name;
let age;
let save;

beforeAll(() => {
  name = $name.getState();
  age = $age.getState();
  save = saveFormBaseFx.use.getCurrent();
});

afterAll(() => {
  changeName(name);
  changeAge(age);
  saveFormBaseFx.use(save);
});

const getValidName = () => {
  const numFrom2To40 = faker.datatype.number({ min: 2, max: 40 });
  return faker.datatype.string(numFrom2To40);
};

const getInvalidName = () => {
  const numFrom0To1 = faker.datatype.number({ min: 0, max: 1 });
  const randomShortName = faker.datatype.string(numFrom0To1);

  const numFrom41 = faker.datatype.number({ min: 41 });
  const randomLongName = faker.datatype.string(numFrom41);

  return faker.random.arrayElement([randomShortName, randomLongName]);
};

const getValidAge = () => {
  return faker.datatype.number({ min: 18 });
};

const getInvalidAge = () => {
  return faker.datatype.number({ max: 17 });
};

describe("Rules point 1", () => {
  test("a name is valid when it consists of more than two chars and less than forty chars", () => {
    const validName = getValidName();

    changeName(validName);

    expect($nameHasFrom2To40Chars.getState()).toBeTruthy();
  });

  test("a name is invalid when it consists of less than two chars and more than forty chars", () => {
    // Arrange
    const invalidName = getInvalidName();

    // Act
    changeName(invalidName);

    // Assertion
    expect($nameHasFrom2To40Chars.getState()).toBeFalsy();
  });
});

describe("Rules point 2", () => {
  test("the output has validation message on invalid name", () => {
    const invalidName = getInvalidName();

    changeName(invalidName);

    expect($output.getState()).toBe("Name should be from 2 to 40 chars");
  });
});

describe("Rules point 3", () => {
  test("an age is valid when user is adult", () => {
    const validAge = getValidAge();

    changeAge(validAge);

    expect($isAdult.getState()).toBeTruthy();
  });

  test("an age is invalid when user isn't adult", () => {
    const invalidAge = getInvalidAge();

    changeAge(invalidAge);

    expect($isAdult.getState()).toBeFalsy();
  });
});

describe("Rules point 4", () => {
  test("the output has validation message on invalid age", () => {
    // Arrange
    const validName = getValidName();
    const invalidAge = getInvalidAge();

    // Act
    changeName(validName);
    changeAge(invalidAge);

    // Assertion
    expect($output.getState()).toBe("You are too young");
  });
});

describe("Rules point 5", () => {
  test("an invalid form isn't submitted to server", () => {
    // Arrange
    const invalidName = getInvalidName();
    const invalidAge = getInvalidAge();

    const mock = jest.fn();
    saveFormBaseFx.use(mock);

    // Act
    changeName(invalidName);
    changeAge(invalidAge);
    submit();

    // Assertion
    expect(mock).toBeCalledTimes(0);
  });
});

describe("Rules points 6, 8", () => {
  test("a valid form is submitted to server", () => {
    // Arrange
    const validName = getValidName();
    const validAge = getValidAge();

    const mock = jest.fn();
    saveFormBaseFx.use(mock);

    // Act
    changeName(validName);
    changeAge(validAge);
    submit();

    // Assertion
    expect(mock).toBeCalledTimes(1);
    expect(mock).toBeCalledWith({ name: validName, age: validAge });
  });
});

describe("Rules point 7", () => {
  test("the output has question 'Are you ${firstName}. Right?'", () => {
    // Arrange
    const validName = getValidName();
    const validAge = getValidAge();

    const mock = jest.fn();
    saveFormBaseFx.use(mock);

    // Act
    changeName(validName);
    changeAge(validAge);

    // Assertion
    expect($output.getState()).toBe("Are you " + validName + "? Right?");
  });
});
