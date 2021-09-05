import faker from "faker";
import {
  $nameHasFrom2To40Chars,
  $isAdult,
  $output,
  $name,
  submit,
  saveFormBaseFx,
  $age,
} from "./model";

import { fork, allSettled } from "effector";

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
    const scope = fork({ values: new Map().set($name, validName) });

    expect(scope.getState($nameHasFrom2To40Chars)).toBeTruthy();
  });

  test("a name is invalid when it consists of less than two chars and more than forty chars", () => {
    // Arrange
    const invalidName = getInvalidName();
    const scope = fork({ values: new Map([[$name, invalidName]]) });

    // Assertion
    expect(scope.getState($nameHasFrom2To40Chars)).toBeFalsy();
  });
});

describe("Rules point 2", () => {
  test("the output has validation message on invalid name", () => {
    const invalidName = getInvalidName();
    const scope = fork({
      values: new Map().set($name, invalidName),
    });

    expect(scope.getState($output)).toBe("Name should be from 2 to 40 chars");
  });
});

describe("Rules point 3", () => {
  test("an age is valid when user is adult", () => {
    const validAge = getValidAge();
    const scope = fork({ values: new Map().set($age, validAge) });

    expect(scope.getState($isAdult)).toBeTruthy();
  });

  test("an age is invalid when user isn't adult", () => {
    const invalidAge = getInvalidAge();
    const scope = fork({ values: new Map().set($age, invalidAge) });

    expect(scope.getState($isAdult)).toBeFalsy();
  });
});

describe("Rules point 4", () => {
  test("the output has validation message on invalid age", () => {
    // Arrange
    const validName = getValidName();
    const invalidAge = getInvalidAge();
    const scope = fork({
      values: [
        [$name, validName],
        [$age, invalidAge],
      ],
    });

    // Assertion
    expect(scope.getState($output)).toBe("You are too young");
  });
});

describe("Rules point 5", () => {
  test("an invalid form isn't submitted to server", async () => {
    // Arrange
    const invalidName = getInvalidName();
    const invalidAge = getInvalidAge();
    const mock = jest.fn();

    const scope = fork({
      values: new Map().set($name, invalidName).set($age, invalidAge),
      handlers: new Map().set(saveFormBaseFx, mock),
    });

    //Act
    await allSettled(submit, { scope });

    // Assertion
    expect(mock).toBeCalledTimes(0);
  });
});

describe("Rules points 6, 8", () => {
  test("a valid form is submitted to server", async () => {
    // Arrange
    const validName = getValidName();
    const validAge = getValidAge();
    const mock = jest.fn();

    const scope = fork({
      values: new Map().set($name, validName).set($age, validAge),
      handlers: new Map().set(saveFormBaseFx, mock),
    });

    // Act
    await allSettled(submit, { scope });

    // Assertion
    expect(mock).toBeCalledTimes(1);
    expect(mock).toBeCalledWith({ name: validName, age: validAge });
  });
});

describe("Rules point 7", () => {
  test("the output has question 'Are you ${firstName}. Right?'", () => {
    const mock = jest.fn();
    const validName = getValidName();
    const validAge = getValidAge();

    const scope = fork({
      values: new Map().set($name, validName).set($age, validAge),
      handlers: new Map().set(saveFormBaseFx, mock),
    });

    expect(scope.getState($output)).toBe("Are you " + validName + "? Right?");
  });
});
