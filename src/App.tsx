import React, {
  InputHTMLAttributes,
  OutputHTMLAttributes,
  FormHTMLAttributes,
  ButtonHTMLAttributes,
} from "react";

import { reflect } from "@effector/reflect";

import {
  changeName,
  changeAge,
  submit,
  $name,
  $age,
  $isValid,
  $output,
} from "./model";

import "./App.css";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

const Name = reflect<InputProps>({
  bind: {
    value: $name,
    onChange: changeName.prepend((e) => e.target.value),
  },
  view: (props) => (
    <div className="formSection">
      <input {...props} required id="name" placeholder="Vasya" />
      <label htmlFor="name">Name</label>
    </div>
  ),
});

const Age = reflect<InputProps>({
  bind: {
    value: $age,
    onChange: changeAge.prepend((e) => +e.target.value),
  },
  view: (props) => (
    <div className="formSection">
      <input {...props} id="age" type="number" min="0" required />
      <label htmlFor="age">Age</label>
    </div>
  ),
});

type OutputProps = OutputHTMLAttributes<HTMLElement> & { text: string };

const Output = reflect<OutputProps>({
  bind: { text: $output },
  view: (props) => <output {...props}>Output: {props.text}</output>,
});

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

const Submit = reflect<ButtonProps>({
  bind: {
    onClick: submit.prepend(() => {}),
    disabled: $isValid.map((valid) => !valid),
  },
  view: (props) => (
    <button {...props} type="button">
      Submit
    </button>
  ),
});

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
