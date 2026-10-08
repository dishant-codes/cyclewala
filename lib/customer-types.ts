/* Shapes shared by the customer code and its two storage back-ends (MongoDB and plain files). */

export type Customer = {
  /** the account's stable id as text — what the sign-in cookie and orders refer to */
  key: string;
  /** readable reference, e.g. CU-MUXS29OO-87E1 */
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  /** product slugs, newest first */
  wishlist: string[];
  /** consecutive wrong passwords, and until when sign-in is paused (epoch ms) */
  failed: number;
  lockedUntil: number;
  createdAt: string;
  updatedAt: string;
};

export class EmailTaken extends Error {}

/** What a storage back-end has to do. Everything above this line is the same whichever one is used. */
export interface CustomerStore {
  findByKey(key: string): Promise<Customer | null>;
  findByEmail(email: string): Promise<Customer | null>;
  /** throws EmailTaken when the email already has an account */
  insert(input: { email: string; name: string; passwordHash: string }): Promise<Customer>;
  /** saves name, password hash and the sign-in lock counters (not the wishlist) */
  update(customer: Customer): Promise<void>;
  /** add or remove one cycle; returns the new wishlist, newest first */
  setWished(customer: Customer, slug: string, wished: boolean): Promise<string[]>;
  /** delete the account and everything stored for it */
  remove(customer: Customer): Promise<void>;
}

export const MAX_WISHLIST = 200;
