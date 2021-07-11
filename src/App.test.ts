import faker from "faker";
import {
  $nameHasFrom2To40Chars,
  $isAdult,
  $output,
  $name,
  changeName,
  changeAge,
  submit,
  saveFormBaseFx,
  $age,
} from "./model";

import { root, fork, allSettled, hydrate } from "effector-root";

describe("Rules point 1", () => {
  test("a name is valid when it consists of more than two chars and less than forty chars", () => {
    const numFrom2To40 = faker.datatype.number({ min: 2, max: 40 });
    const randomName = faker.datatype.string(numFrom2To40);
    const scope = fork(root, { values: { [$name.sid]: randomName } });

    expect(scope.getState($nameHasFrom2To40Chars)).toBeTruthy();
  });

  test("a name is invalid when it consists of less than two chars and more than forty chars", () => {
    // Arrange
    const numFrom0To1 = faker.datatype.number({ min: 0, max: 1 });
    const randomShortName = faker.datatype.string(numFrom0To1);

    const numFrom41 = faker.datatype.number({ min: 41 });
    const randomLongName = faker.datatype.string(numFrom41);

    const randomName = faker.random.arrayElement([
      randomShortName,
      randomLongName,
    ]);

    const scope = fork(root);

    // Act
    hydrate(scope, { values: new Map([[$name, randomName]]) });

    // Assertion
    expect(scope.getState($nameHasFrom2To40Chars)).toBeFalsy();
  });
});

describe("Rules point 2", () => {
  test("the output has validation message on invalid name", () => {
    const numFrom41 = faker.datatype.number({ min: 41 });
    const invalidRandomName = faker.datatype.string(numFrom41);
    const scope = fork(root, {
      values: new Map().set($name, invalidRandomName),
    });

    expect(scope.getState($output)).toBe("Name should be from 2 to 40 chars");
  });
});

describe("Rules point 3", () => {
  test("an age is valid when user is adult", () => {
    const numFrom18 = faker.datatype.number({ min: 18 });
    const scope = fork(root, { values: { [$age.sid]: numFrom18 } });

    expect(scope.getState($isAdult)).toBeTruthy();
  });

  test("an age is invalid when user isn't adult", () => {
    const numLess18 = faker.datatype.number({ max: 17 });
    const scope = fork(root, { values: new Map().set($age, numLess18) });

    changeAge(numLess18);

    expect(scope.getState($isAdult)).toBeFalsy();
  });
});

describe("Rules point 4", () => {
  test("the output has validation message on invalid age", () => {
    // Arrange
    const numFrom2To40 = faker.datatype.number({ min: 2, max: 40 });
    const validRandomName = faker.datatype.string(numFrom2To40);
    const invalidRandomAge = faker.datatype.number({ max: 17 });
    const scope = fork(root, {
      values: { [$name.sid]: validRandomName, [$age.sid]: invalidRandomAge },
    });

    // Assertion
    expect(scope.getState($output)).toBe("You are too young");
  });
});

describe("Rules point 5", () => {
  test("an invalid form isn't submitted to server", async () => {
    const mock = jest.fn();
    const invalidRandomName = faker.datatype.string(
      faker.datatype.number({ min: 41 })
    );
    const invalidRandomAge = faker.datatype.number({ max: 17 });
    const scope = fork(root, {
      values: new Map()
        .set($name, invalidRandomName)
        .set($age, invalidRandomAge),
      handlers: { [saveFormBaseFx.sid]: mock },
    });

    await allSettled(submit, { scope });

    expect(mock).toBeCalledTimes(0);
  });
});

describe("Rules points 6, 8", () => {
  test("a valid form is submitted to server", async () => {
    const validRandomName = faker.datatype.string(
      faker.datatype.number({ min: 2, max: 40 })
    );
    const validRandomAge = faker.datatype.number({ min: 18 });
    const mock = jest.fn();
    const scope = fork(root, {
      values: new Map().set($name, validRandomName).set($age, validRandomAge),
      handlers: new Map().set(saveFormBaseFx, mock),
    });

    await allSettled(submit, { scope });

    expect(mock).toBeCalledTimes(1);
    expect(mock).toBeCalledWith({ name: validRandomName, age: validRandomAge });
  });
});

describe("Rules point 7", () => {
  test("the output has question 'Are you ${firstName}. Right?'", () => {
    const mock = jest.fn();
    const validRandomName = faker.datatype.string(
      faker.datatype.number({ min: 2, max: 40 })
    );
    const validRandomAge = faker.datatype.number({ min: 18 });

    const scope = fork(root, {
      values: { [$name.sid]: validRandomName, [$age.sid]: validRandomAge },
      handlers: { [saveFormBaseFx.sid]: mock },
    });

    expect(scope.getState($output)).toBe(
      "Are you " + validRandomName + "? Right?"
    );
  });
});
