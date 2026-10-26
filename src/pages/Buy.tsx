import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Mail, MessageCircle, Minus, Plus } from "lucide-react";
import { COLOURS } from "../constants/gallery";
import type { ColourOption } from "../constants/gallery";
import { ORDER_FACTS, PRICE, formatINR } from "../constants/order";
import { SITE, mailto, whatsappLink } from "../constants/site";
import { usePageTitle } from "../hooks/usePageTitle";

const FALLBACK: ColourOption = { name: "JUNO.1", swatch: "#2a2a2e", src: "" };

const field =
  "w-full rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-3 text-base text-white placeholder:text-white/35 transition-colors focus:border-white/40 focus:outline-none";
const label = "block text-sm font-semibold text-white/80";

/** Large preview of one colour, falling back to a tinted panel until the photo exists. */
function ColourPreview({ colour, active }: { colour: ColourOption; active: boolean }): React.ReactElement {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className="absolute inset-0"
      style={{
        opacity: active ? 1 : 0,
        zIndex: active ? 2 : 1,
        // Same dissolve as the home viewer: real opacity transitions, no snapping layers.
        transition: active
          ? "opacity 700ms cubic-bezier(0.22,1,0.36,1)"
          : "opacity 450ms ease 750ms",
      }}
      aria-hidden={!active}
    >
      {failed || !colour.src ? (
        <div
          className="flex h-full w-full flex-col items-center justify-center gap-3"
          style={{ background: `radial-gradient(60% 60% at 50% 45%, ${colour.swatch}, #0b0b0c 75%)` }}
          role="img"
          aria-label={`JUNO.1 in ${colour.name}`}
        >
          <span className="font-display text-4xl font-semibold tracking-tight sm:text-6xl">JUNO.1</span>
          <span className="text-sm text-white/60">{colour.name}</span>
          {import.meta.env.DEV && colour.src && (
            <p className="text-xs text-white/40">Add image: public{colour.src}</p>
          )}
        </div>
      ) : (
        <img
          src={colour.src}
          alt={`JUNO.1 in ${colour.name}`}
          draggable={false}
          onError={() => setFailed(true)}
          className="h-full w-full select-none object-contain p-6 sm:p-10"
        />
      )}
    </div>
  );
}

/** Inline validation message shown under a field once the visitor has tried to continue. */
function FieldError({
  id,
  show,
  children,
}: {
  id: string;
  show: boolean;
  children: React.ReactNode;
}): React.ReactElement | null {
  if (!show) return null;
  return (
    <p id={id} className="mt-1.5 text-sm text-[#ff9aa2]">
      {children}
    </p>
  );
}

/** Orders are taken on WhatsApp. The page collects colour, quantity and delivery details first. */
function Buy(): React.ReactElement {
  usePageTitle("Buy");

  const [colourIndex, setColourIndex] = useState(0);
  const colour = COLOURS[colourIndex] ?? FALLBACK;
  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [pin, setPin] = useState("");
  const [notes, setNotes] = useState("");
  const [attempted, setAttempted] = useState(false);

  // Every address field is required; WhatsApp should never open with a half-filled order.
  const missing = {
    name: !name.trim(),
    address: !address.trim(),
    city: !city.trim(),
    district: !district.trim(),
    state: !state.trim(),
    pin: !/^\d{6}$/.test(pin.trim()),
  };
  type FieldKey = keyof typeof missing;
  const fieldOrder: FieldKey[] = ["name", "address", "city", "district", "state", "pin"];
  const fieldIds: Record<FieldKey, string> = {
    name: "order-name",
    address: "order-address",
    city: "order-city",
    district: "order-district",
    state: "order-state",
    pin: "order-pin",
  };
  const messages: Record<FieldKey, string> = {
    name: "Enter your name.",
    address: "Enter your delivery address.",
    city: "Enter your city or town.",
    district: "Enter your district.",
    state: "Enter your state.",
    pin: "Enter your 6-digit PIN code.",
  };
  const firstMissing = fieldOrder.find((key) => missing[key]);
  const complete = firstMissing === undefined;
  const show = (key: FieldKey): boolean => attempted && missing[key];
  const invalidStyle = (key: FieldKey): React.CSSProperties | undefined =>
    show(key) ? { borderColor: "#e5101c" } : undefined;

  const orderMessage = [
    "Hi, I'd like to order a JUNO.1.",
    "",
    `Colour: ${colour.name}`,
    `Quantity: ${quantity}`,
    `Price: ${formatINR(PRICE.current)} each`,
    "",
    `Name: ${name.trim()}`,
    `Delivery address: ${address.trim()}`,
    `City: ${city.trim()}`,
    `District: ${district.trim()}`,
    `State: ${state.trim()}`,
    `PIN code: ${pin.trim()}`,
    ...(notes.trim() ? [`Notes: ${notes.trim()}`] : []),
  ].join("\n");

  const onSend = (e: React.MouseEvent<HTMLAnchorElement>): void => {
    if (complete) return;
    e.preventDefault();
    setAttempted(true);
    if (firstMissing) document.getElementById(fieldIds[firstMissing])?.focus();
  };

  return (
    <>
      <section className="px-5 pb-16 pt-16 sm:px-10 sm:pt-24">
        <div className="screen-max-width">
          <h1 className="page-title" data-split>
            Buy JUNO.1
          </h1>
          <p className="prose-juno mt-8 max-w-[46ch] text-xl" data-reveal>
            Pick your colour, set your quantity and add your delivery details. The button then opens
            WhatsApp with everything written out, ready for you to send.
          </p>

          <div className="mt-7 flex flex-wrap items-baseline gap-x-4 gap-y-2" data-reveal>
            <span className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              {formatINR(PRICE.current)}
            </span>
            {PRICE.was !== null && (
              <>
                <span className="text-xl text-gray line-through">{formatINR(PRICE.was)}</span>
                <span className="rounded-full bg-cap px-3 py-1 text-xs font-semibold text-black">
                  Save {formatINR(PRICE.was - PRICE.current)}
                </span>
              </>
            )}
          </div>
          <p className="mt-2 text-sm text-gray" data-reveal>
            Unit price. Delivery is confirmed on WhatsApp for your PIN code.
          </p>

          <div className="mt-12 grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
            {/* Colour preview */}
            <div>
              <div className="relative aspect-square w-full overflow-hidden rounded-[2rem] bg-[#0b0b0c]">
                {COLOURS.map((c, n) => (
                  <ColourPreview key={c.name} colour={c} active={n === colourIndex} />
                ))}
              </div>

              <fieldset className="mt-6">
                <legend className="text-sm font-semibold text-gray">Colour</legend>
                <div className="mt-3 flex flex-wrap gap-3">
                  {COLOURS.map((c, n) => {
                    const selected = n === colourIndex;
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setColourIndex(n)}
                        aria-pressed={selected}
                        className={`flex items-center gap-3 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                          selected
                            ? "border-white text-white"
                            : "border-white/20 text-gray-100 hover:border-white/50 hover:text-white"
                        }`}
                      >
                        <span
                          className="h-4 w-4 rounded-full border border-white/30"
                          style={{ background: c.swatch }}
                          aria-hidden
                        />
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            </div>

            {/* Order details */}
            <div className="rounded-[2rem] border border-line p-6 sm:p-8">
              <h2 className="font-display text-2xl font-medium tracking-tight">Your order</h2>

              <div className="mt-8 flex items-center justify-between gap-4 border-b border-line pb-6">
                <div>
                  <p className="text-sm font-semibold text-white/80">Quantity</p>
                  <p className="mt-1 text-sm text-gray">How many units you need</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:border-white hover:bg-white/10 disabled:opacity-40"
                    disabled={quantity <= 1}
                  >
                    <Minus size={18} aria-hidden />
                  </button>
                  <span className="w-8 text-center font-display text-xl tabular-nums" aria-live="polite">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                    aria-label="Increase quantity"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:border-white hover:bg-white/10 disabled:opacity-40"
                    disabled={quantity >= 10}
                  >
                    <Plus size={18} aria-hidden />
                  </button>
                </div>
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <label className={label} htmlFor="order-name">
                    Your name
                  </label>
                  <input
                    id="order-name"
                    className={`${field} mt-2`}
                    style={invalidStyle("name")}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    aria-invalid={show("name")}
                    aria-describedby={show("name") ? "order-name-error" : undefined}
                    placeholder="Full name"
                  />
                  <FieldError id="order-name-error" show={show("name")}>
                    {messages.name}
                  </FieldError>
                </div>
                <div>
                  <label className={label} htmlFor="order-address">
                    Delivery address
                  </label>
                  <textarea
                    id="order-address"
                    className={`${field} mt-2 min-h-[92px] resize-y`}
                    style={invalidStyle("address")}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    autoComplete="street-address"
                    aria-invalid={show("address")}
                    aria-describedby={show("address") ? "order-address-error" : undefined}
                    placeholder="House or building, street, area"
                    rows={3}
                  />
                  <FieldError id="order-address-error" show={show("address")}>
                    {messages.address}
                  </FieldError>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className={label} htmlFor="order-city">
                      City
                    </label>
                    <input
                      id="order-city"
                      className={`${field} mt-2`}
                      style={invalidStyle("city")}
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      autoComplete="address-level2"
                      aria-invalid={show("city")}
                      aria-describedby={show("city") ? "order-city-error" : undefined}
                      placeholder="City or town"
                    />
                    <FieldError id="order-city-error" show={show("city")}>
                      {messages.city}
                    </FieldError>
                  </div>
                  <div>
                    <label className={label} htmlFor="order-district">
                      District
                    </label>
                    <input
                      id="order-district"
                      className={`${field} mt-2`}
                      style={invalidStyle("district")}
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      aria-invalid={show("district")}
                      aria-describedby={show("district") ? "order-district-error" : undefined}
                      placeholder="District"
                    />
                    <FieldError id="order-district-error" show={show("district")}>
                      {messages.district}
                    </FieldError>
                  </div>
                  <div>
                    <label className={label} htmlFor="order-state">
                      State
                    </label>
                    <input
                      id="order-state"
                      className={`${field} mt-2`}
                      style={invalidStyle("state")}
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      autoComplete="address-level1"
                      aria-invalid={show("state")}
                      aria-describedby={show("state") ? "order-state-error" : undefined}
                      placeholder="State"
                    />
                    <FieldError id="order-state-error" show={show("state")}>
                      {messages.state}
                    </FieldError>
                  </div>
                  <div>
                    <label className={label} htmlFor="order-pin">
                      PIN code
                    </label>
                    <input
                      id="order-pin"
                      className={`${field} mt-2`}
                      style={invalidStyle("pin")}
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      autoComplete="postal-code"
                      inputMode="numeric"
                      maxLength={6}
                      aria-invalid={show("pin")}
                      aria-describedby={show("pin") ? "order-pin-error" : undefined}
                      placeholder="6-digit PIN code"
                    />
                    <FieldError id="order-pin-error" show={show("pin")}>
                      {messages.pin}
                    </FieldError>
                  </div>
                </div>
                <div>
                  <label className={label} htmlFor="order-notes">
                    Anything else? <span className="font-normal text-gray">(optional)</span>
                  </label>
                  <input
                    id="order-notes"
                    className={`${field} mt-2`}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Footswitch, colour question, delivery note…"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-baseline justify-between gap-4 border-t border-line pt-5">
                <p className="text-sm text-gray" aria-live="polite">
                  {colour.name} · {quantity} {quantity === 1 ? "unit" : "units"}
                </p>
                <p className="font-display text-2xl font-semibold tracking-tight">
                  {formatINR(PRICE.current * quantity)}
                </p>
              </div>
              <p className="mt-1 text-xs text-gray">Plus delivery, confirmed on WhatsApp.</p>

              {attempted && !complete && (
                <p
                  role="alert"
                  className="mt-4 rounded-2xl border border-[#e5101c]/50 bg-[#e5101c]/10 px-4 py-3 text-sm text-[#ffb3b8]"
                >
                  Fill in your name, delivery address, city, district, state and 6-digit PIN code
                  before sending.
                </p>
              )}

              <a
                href={whatsappLink(orderMessage)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onSend}
                className={`btn mt-4 w-full gap-3 !px-8 !py-4 text-lg ${
                  complete ? "" : "opacity-60"
                }`}
              >
                <MessageCircle size={22} aria-hidden />
                Send order on WhatsApp
                <ArrowUpRight size={20} aria-hidden />
              </a>

              <p className="mt-4 text-sm leading-relaxed text-gray">
                This opens WhatsApp with your colour, quantity and address already in the message.
                Nothing is sent until you press send there. WhatsApp:{" "}
                <span className="text-white">{SITE.whatsappDisplay}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What to know before ordering */}
      <section className="bg-surface px-5 py-20 sm:px-10 sm:py-28" aria-labelledby="order-info-heading">
        <div className="screen-max-width">
          <h2 id="order-info-heading" className="section-heading" data-split>
            Good to know
          </h2>
          <dl className="mt-12 grid gap-x-12 gap-y-7 sm:grid-cols-2">
            {ORDER_FACTS.map((fact) => (
              <div key={fact.label} className="border-t border-line pt-4">
                <dt className="text-sm font-semibold text-gray">{fact.label}</dt>
                <dd className="mt-1 text-lg text-gray-100">{fact.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-12 flex flex-col gap-4 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-gray-100">
              Ordering questions are answered on the{" "}
              <Link to="/faq" className="text-white underline decoration-cap underline-offset-4">
                FAQ page
              </Link>
              .
            </p>
            <a
              href={mailto("JUNO.1 order")}
              className="inline-flex items-center gap-2 text-cap underline-offset-4 hover:underline"
            >
              <Mail size={18} aria-hidden />
              {SITE.email}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

export default Buy;
