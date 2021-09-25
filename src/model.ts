import {
  createEvent,
  restore,
  combine,
  createEffect,
  StoreValue,
  guard,
  attach,
} from "effector";

// Events
export const changeName = createEvent<string>();
export const changeAge = createEvent<number>();
export const submit = createEvent();

// Stores
export const $name = restore(changeName, "");
export const $age = restore(changeAge, 18);

export const $nameHasFrom2To40Chars = $name.map(
  (name) => name.length >= 2 && name.length <= 40
);
export const $isAdult = $age.map((age) => age >= 18);
export const $isValid = combine(
  [$nameHasFrom2To40Chars, $isAdult],
  (validators) => validators.every(Boolean)
);

export const $output = combine(
  {
    name: $name,
    isAdult: $isAdult,
    isNameCorrect: $nameHasFrom2To40Chars,
  },
  ({ name, isAdult, isNameCorrect }) => {
    if (!isNameCorrect) {
      return `Name should be from 2 to 40 chars`;
    }

    if (!isAdult) {
      return `You are too young`;
    }

    return `Are you ${name}? Right?`;
  }
);

const $form = combine({ name: $name, age: $age });

// Effects
type Params = StoreValue<typeof $form>;
type Response = Params;

export const saveFormBaseFx = createEffect<Params, Response>({
  handler: (params) => {
    return new Promise((res) => setTimeout(() => res(params), 5000));
  },
});

const saveFormFx = attach({ effect: saveFormBaseFx });

// Connections
guard({
  source: $form,
  clock: submit,
  filter: $isValid,
  target: saveFormBaseFx,
});
