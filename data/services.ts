/* Workshop services — the single source of truth for what the Services
 * section shows AND what the booking API accepts. The server looks the price
 * up here by `id`; it never trusts a price sent from the browser.
 *
 * To change a price or a checklist, edit it here.
 */

export type ServiceId = "non-gear" | "gear" | "home";

export type Service = {
  id: ServiceId;
  title: string;
  subtitle: string;
  price: number;
  items: string[];
  /** doorstep visits need an address; in-shop bookings don't */
  requiresAddress: boolean;
};

export const SERVICES: Service[] = [
  {
    id: "non-gear",
    title: "Non-Gear Cycle Service",
    subtitle: "For regular & kids' cycles",
    price: 399,
    items: [
      "Check & adjust brakes",
      "Check & adjust fork, wheels, hub & bottom bracket",
      "Wheel truing check",
      "Lubrication & general clean-up",
    ],
    requiresAddress: false,
  },
  {
    id: "gear",
    title: "Gear Cycle Service",
    subtitle: "For mountain & geared cycles",
    price: 499,
    items: [
      "Everything in the non-gear service",
      "Gear & derailleur tuning",
      "Degrease & re-lubricate the drivetrain",
      "Full safety check before handover",
    ],
    requiresAddress: false,
  },
  {
    id: "home",
    title: "Home Service",
    subtitle: "Expert service at your doorstep",
    price: 499,
    items: [
      "All regular & gear service features included",
      "Convenient doorstep service",
      "Professional tools and equipment",
    ],
    requiresAddress: true,
  },
];

export const getService = (id: string) => SERVICES.find((s) => s.id === id);
