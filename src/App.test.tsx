import React from "react";
import faker from "faker";
import { $name, saveFormBaseFx, $age } from "./model";

import "@testing-library/jest-dom";

import App from "./App";

import { root, fork } from "effector-root";
import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "effector-react/ssr";

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

const selectors = {
  name: async () => screen.findByLabelText("Name"),
  age: async () => screen.findByLabelText("Age"),
  submit: () => screen.findByText("Submit"),
};

describe("Rules point 1", () => {
  test("a name is valid when it consists of more than two chars and less than forty chars", async () => {
    // Arrange
    const validName = getValidName();
    const validAge = getValidAge();

    const scope = fork(root, { values: { [$age.sid]: validAge } });

    render(
      <Provider value={scope}>
        <App />
      </Provider>
    );

    const name = await selectors.name();
    const submit = await selectors.submit();

    // Act
    fireEvent.change(name, { target: { value: validName } });

    // Assertion
    expect(submit).toBeEnabled();
  });

  test("a name is invalid when it consists of less than two chars and more than forty chars", async () => {
    // Arrange
    const invalidName = getInvalidName();

    const scope = fork(root);

    render(
      <Provider value={scope}>
        <App />
      </Provider>
    );

    const name = await selectors.name();
    const submit = await selectors.submit();

    // Act
    fireEvent.change(name, { target: { value: invalidName } });

    // Assertion
    expect(submit).toBeDisabled();
  });
});

describe("Rules point 2", () => {
  test("the output has validation message on invalid name", async () => {
    // Arrange
    const invalidName = getInvalidName();

    const scope = fork(root);

    render(
      <Provider value={scope}>
        <App />
      </Provider>
    );

    const name = await selectors.name();

    // Act
    fireEvent.change(name, { target: { value: invalidName } });

    // Assertion
    expect(
      screen.getByText("Output: Name should be from 2 to 40 chars")
    ).toBeInTheDocument();
  });
});

describe("Rules point 3", () => {
  test("an age is valid when user is adult", async () => {
    // Arrange
    const validName = getValidName();
    const validAge = getValidAge();

    const scope = fork(root, { values: { [$name.sid]: validName } });

    render(
      <Provider value={scope}>
        <App />
      </Provider>
    );

    const age = await selectors.age();
    const submit = await selectors.submit();

    // Act
    fireEvent.change(age, { target: { value: validAge } });

    // Assertion
    expect(submit).toBeEnabled();
  });

  test("an age is invalid when user isn't adult", async () => {
    // Arrange
    const validName = getValidName();
    const invalidAge = getInvalidAge();

    const scope = fork(root, { values: { [$name.sid]: validName } });

    render(
      <Provider value={scope}>
        <App />
      </Provider>
    );

    const age = await selectors.age();
    const submit = await selectors.submit();

    // Act
    fireEvent.change(age, { target: { value: invalidAge } });

    // Assertion
    expect(submit).toBeDisabled();
  });
});

describe("Rules point 4", () => {
  test("the output has validation message on invalid age", async () => {
    // Arrange
    const validName = getValidName();

    const invalidAge = getInvalidAge();

    const scope = fork(root, {
      values: { [$name.sid]: validName },
    });

    render(
      <Provider value={scope}>
        <App />
      </Provider>
    );

    const age = await selectors.age();

    // Act
    fireEvent.change(age, { target: { value: invalidAge } });

    // Assertion
    expect(screen.getByText("Output: You are too young")).toBeInTheDocument();
  });
});

describe("Rules point 5", () => {
  test("an invalid form isn't submitted to server", async () => {
    // Arrange
    const mock = jest.fn();

    const invalidName = getInvalidName();
    const invalidAge = getInvalidAge();

    const scope = fork(root);

    render(
      <Provider value={scope}>
        <App />
      </Provider>
    );

    const name = await selectors.name();
    const age = await selectors.age();
    const submit = await selectors.submit();

    // Act
    fireEvent.change(name, { target: { value: invalidName } });
    fireEvent.change(age, { target: { value: invalidAge } });
    fireEvent.click(submit);

    expect(mock).toBeCalledTimes(0);
  });
});

describe("Rules points 6, 8", () => {
  test("a valid form is submitted to server", async () => {
    // Arrange
    const validName = getValidName();
    const validAge = getValidAge();
    const mock = jest.fn();

    const scope = fork(root, {
      values: new Map().set($name, validName).set($age, validAge),
      handlers: new Map().set(saveFormBaseFx, mock),
    });

    render(
      <Provider value={scope}>
        <App />
      </Provider>
    );

    const submit = await selectors.submit();

    // Act
    fireEvent.click(submit);

    // Assertion
    expect(mock).toBeCalledTimes(1);
    expect(mock).toBeCalledWith({ name: validName, age: validAge });
  });
});

describe("Rules point 7", () => {
  test("the output has question 'Are you ${firstName}. Right?'", async () => {
    // Arrange
    const validName = getValidName();
    const validAge = getValidAge();

    const mock = jest.fn();

    const scope = fork(root, {
      handlers: { [saveFormBaseFx.sid]: mock },
    });

    render(
      <Provider value={scope}>
        <App />
      </Provider>
    );

    const name = await selectors.name();
    const age = await selectors.age();

    //Act
    fireEvent.change(name, { target: { value: validName } });
    fireEvent.change(age, { target: { value: validAge } });

    // Assertion
    expect(
      screen.getByText("Output: Are you " + validName + "? Right?")
    ).toBeInTheDocument();
  });
});
