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

describe("Rules point 1", () => {
  test("a name is valid when it consists of more than two chars and less than forty chars", () => {
    const numFrom2To40 = faker.datatype.number({ min: 2, max: 40 });
    const randomName = faker.datatype.string(numFrom2To40);

    changeName(randomName);

    expect($nameHasFrom2To40Chars.getState()).toBeTruthy();
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

    // Act
    changeName(randomName);

    // Assertion
    expect($nameHasFrom2To40Chars.getState()).toBeFalsy();
  });
});

describe("Rules point 2", () => {
  test("the output has validation message on invalid name", () => {
    const numFrom41 = faker.datatype.number({ min: 41 });
    const invalidRandomName = faker.datatype.string(numFrom41);

    changeName(invalidRandomName);

    expect($output.getState()).toBe("Name should be from 2 to 40 chars");
  });
});

describe("Rules point 3", () => {
  test("an age is valid when user is adult", () => {
    const numFrom18 = faker.datatype.number({ min: 18 });

    changeAge(numFrom18);

    expect($isAdult.getState()).toBeTruthy();
  });

  test("an age is invalid when user isn't adult", () => {
    const numFrom18 = faker.datatype.number({ max: 17 });

    changeAge(numFrom18);

    expect($isAdult.getState()).toBeFalsy();
  });
});

describe("Rules point 4", () => {
  test("the output has validation message on invalid age", () => {
    // Arrange
    const numFrom2To40 = faker.datatype.number({ min: 2, max: 40 });
    const validRandomName = faker.datatype.string(numFrom2To40);
    changeName(validRandomName);

    const invalidRandomAge = faker.datatype.number({ max: 17 });

    // Act
    changeAge(invalidRandomAge);

    // Assertion
    expect($output.getState()).toBe("You are too young");
  });
});

describe("Rules point 5", () => {
  test("an invalid form isn't submitted to server", () => {
    const mock = jest.fn();
    saveFormBaseFx.use(mock);
    const invalidRandomName = faker.datatype.string(
      faker.datatype.number({ min: 41 })
    );
    const invalidRandomAge = faker.datatype.number({ max: 17 });

    changeName(invalidRandomName);
    changeAge(invalidRandomAge);
    submit();

    expect(mock).toBeCalledTimes(0);
  });
});

describe("Rules points 6, 8", () => {
  test("a valid form is submitted to server", () => {
    const mock = jest.fn();
    saveFormBaseFx.use(mock);
    const validRandomName = faker.datatype.string(
      faker.datatype.number({ min: 2, max: 40 })
    );
    const validRandomAge = faker.datatype.number({ min: 18 });

    changeName(validRandomName);
    changeAge(validRandomAge);
    submit();

    expect(mock).toBeCalledTimes(1);
    expect(mock).toBeCalledWith({ name: validRandomName, age: validRandomAge });
  });
});

describe("Rules point 7", () => {
  test("the output has question 'Are you ${firstName}. Right?'", () => {
    const mock = jest.fn();
    saveFormBaseFx.use(mock);
    const validRandomName = faker.datatype.string(
      faker.datatype.number({ min: 2, max: 40 })
    );
    const validRandomAge = faker.datatype.number({ min: 18 });

    changeName(validRandomName);
    changeAge(validRandomAge);

    expect($output.getState()).toBe("Are you " + validRandomName + "? Right?");
  });
});
