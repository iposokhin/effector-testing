import React, {
  InputHTMLAttributes,
  OutputHTMLAttributes,
  FormHTMLAttributes,
  ButtonHTMLAttributes,
} from "react";

import {
  changeName,
  changeAge,
  submit,
  $name,
  $age,
  $isValid,
  $output,
} from "./model";

import { useStore } from "effector-react";
import { useEvent } from "effector-react/ssr";

import "./App.css";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

const Name: React.FC<InputProps> = (props) => {
  const name = useStore($name);
  const change = useEvent(changeName);

  return (
    <div className="formSection">
      <input
        {...props}
        required
        value={name}
        onChange={(e) => change(e.target.value)}
        id="name"
        placeholder="Vasya"
      />
      <label htmlFor="name">Name</label>
    </div>
  );
};

const Age: React.FC<InputProps> = (props) => {
  const age = useStore($age);
  const change = useEvent(changeAge);

  return (
    <div className="formSection">
      <input
        {...props}
        onChange={(e) => change(+e.target.value)}
        value={age}
        id="age"
        type="number"
        min="0"
        required
      />
      <label htmlFor="age">Age</label>
    </div>
  );
};

type OutputProps = OutputHTMLAttributes<HTMLElement>;

const Output: React.FC<OutputProps> = (props) => {
  const text = useStore($output);

  return <output {...props}>Output: {text}</output>;
};

const Submit: React.FC<ButtonHTMLAttributes<HTMLButtonElement>> = (props) => {
  const disabled = !useStore($isValid);
  const submitFn = useEvent(submit);

  return (
    <button
      {...props}
      onClick={() => submitFn()}
      disabled={disabled}
      type="button"
    >
      Submit
    </button>
  );
};

const Form: React.FC<FormHTMLAttributes<HTMLFormElement>> = (props) => {
  return (
    <form>
      <Name />
      <Age />
      <Output />
      <Submit />
    </form>
  );
};

export default function App() {
  return <Form />;
}
