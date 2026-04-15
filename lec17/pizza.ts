import colors from "colors";
import { Order } from "./phone";
import { currentSimTime, waitBlocking } from "./util";

export type PizzaKind = "Pepperoni" | "Margherita" | "Hawaiian" | "Veggie";

export const TOPPINGS: Record<PizzaKind, string[]> = {
  Pepperoni: ["tomato sauce", "mozzarella", "pepperoni"],
  Margherita: ["tomato sauce", "mozzarella", "basil"],
  Hawaiian: ["tomato sauce", "mozzarella", "ham", "pineapple"],
  Veggie: ["tomato sauce", "mozzarella", "bell peppers", "olives", "onions"],
};

export interface Pizza {
  orderTakenAt: number;
  customer: string;
  pizzaKind: PizzaKind;
  color: colors.Color;
  isDoughPrepared: boolean;
  isBoxed: boolean;
  toppings: string[];
  bakeTime: number;
  isBaked: boolean;
}

export function createPizza(order: Order): Pizza {
  const { customer, pizzaType, color } = order;
  const pizzaKind = pizzaType as PizzaKind; // Assume valid for simplicity
  
  return {
    orderTakenAt: Date.now(),
    customer,
    pizzaKind,
    color,
    isDoughPrepared: false,
    isBoxed: false,
    toppings: [],
    bakeTime: 2000, // All pizzas take the same time to bake for simplicity
    isBaked: false,
  };
}


const PREP_TIMES = {
  prepareDough: 1500,
  addTopping: 400, // per topping
  bake: 2000,
  box: 500,
};

export function prepareDough(pizza: Pizza) {
  console.log(pizza.color(`[${currentSimTime()}, ${pizza.customer}]   Preparing dough...`));
  waitBlocking(PREP_TIMES.prepareDough);
  pizza.isDoughPrepared = true;
  console.log(pizza.color(`[${currentSimTime()}, ${pizza.customer}]   Dough ready!`));
}

export function addTopping(pizza: Pizza, topping: string) {
  console.log(pizza.color(`[${currentSimTime()}, ${pizza.customer}]   Adding topping: ${topping}...`));
  waitBlocking(PREP_TIMES.addTopping);
  pizza.toppings.push(topping);
  console.log(pizza.color(`[${currentSimTime()}, ${pizza.customer}]   Added ${topping}!`));
}

export function boxPizza(pizza: Pizza) {
  console.log(pizza.color(`[${currentSimTime()}, ${pizza.customer}]   Boxing...`));
  waitBlocking(PREP_TIMES.box);
  pizza.isBoxed = true;
  console.log(pizza.color(`[${currentSimTime()}, ${pizza.customer}]   Pizza boxed!`));
}






