/* Workshop services — the single source of truth for what the Services
 * section shows AND what the booking API accepts. The server looks the price
 * up here by `id`; it never trusts a price sent from the browser.
 *
 * To change a price or a checklist, edit it here.
 */

export type ServiceId = "basic-non-gear" | "basic-gear" | "advanced-non-gear" | "advanced-gear";

export type Service = {
  id: ServiceId;
  title: string;
  subtitle: string;
  price: number;
  items: string[];
  /** doorstep visits need an address; in-shop bookings don't */
  requiresAddress: boolean;
};

/** free pickup & drop of the cycle, for customers within this many km of the shop */
export const FREE_PICKUP_KM = 5;

const BASIC = [
  "Check & adjust brakes",
  "Check & adjust fork, wheels, hub & bottom bracket",
  "Wheel truing check",
  "Lubrication & general clean-up",
];

const ADVANCED = [
  "Everything in the basic service",
  "Hub & bottom bracket opened, cleaned & re-greased",
  "Chain & drivetrain degreased and re-lubricated",
  "Wheels trued, spokes tensioned, tyres checked",
];

export const SERVICES: Service[] = [
  {
    id: "basic-non-gear",
    title: "Basic Service",
    subtitle: "Non-gear cycles · regular & kids'",
    price: 499,
    items: BASIC,
    requiresAddress: false,
  },
  {
    id: "basic-gear",
    title: "Basic Gear Service",
    subtitle: "Geared & mountain cycles",
    price: 699,
    items: [...BASIC, "Gear & derailleur tuning"],
    requiresAddress: false,
  },
  {
    id: "advanced-non-gear",
    title: "Advanced Service",
    subtitle: "Non-gear cycles · full overhaul",
    price: 699,
    items: [...ADVANCED, "Full safety check before handover"],
    requiresAddress: false,
  },
  {
    id: "advanced-gear",
    title: "Advanced Gear Service",
    subtitle: "Geared cycles · full overhaul",
    price: 999,
    items: [...ADVANCED, "Gear & derailleur tuning and indexing", "Full safety check before handover"],
    requiresAddress: false,
  },
];

export const getService = (id: string) => SERVICES.find((s) => s.id === id);
