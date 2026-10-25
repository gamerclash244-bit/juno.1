import type { Customer } from "./types";

export type Errors = Partial<Record<keyof Customer, string>>;

export const emptyCustomer: Customer = {
  name: "", phone: "", email: "", line1: "", line2: "", city: "", state: "", pincode: "",
};

export function validateCustomer(c: Customer): Errors {
  const e: Errors = {};
  if (c.name.trim().length < 2) e.name = "Enter your full name.";
  if (!/^[6-9]\d{9}$/.test(c.phone.replace(/[\s-]/g, ""))) e.phone = "Enter a 10-digit Indian mobile number.";
  if (!/^\S+@\S+\.\S+$/.test(c.email.trim())) e.email = "Enter a valid email address.";
  if (c.line1.trim().length < 5) e.line1 = "Enter your house or flat number and street.";
  if (c.city.trim().length < 2) e.city = "Enter your city or town.";
  if (!c.state) e.state = "Choose your state.";
  if (!/^[1-9]\d{5}$/.test(c.pincode.trim())) e.pincode = "Enter a 6-digit PIN code.";
  return e;
}
