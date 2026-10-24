import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AuthPanel from "../components/buy/AuthPanel";
import StatusChip from "../components/buy/StatusChip";
import { formatINR } from "../constants/shop";
import { useAuth } from "../context/AuthContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { api } from "../lib/api";
import { formatDate } from "../lib/format";
import type { Order } from "../lib/types";

function Orders(): React.ReactElement {
  usePageTitle("My orders");
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      setOrders(null);
      return;
    }
    let alive = true;
    api
      .listOrders()
      .then((o) => alive && setOrders(o))
      .catch((e: unknown) => alive && setError(e instanceof Error ? e.message : "Could not load your orders."));
    return () => {
      alive = false;
    };
  }, [user]);

  return (
    <section className="px-5 pb-24 pt-16 sm:px-10 sm:pt-24">
      <div className="screen-max-width">
        <h1 className="page-title" data-split>My orders</h1>
        <p className="prose-juno mt-8 text-xl" data-reveal>
          Open an order to see where it is and what we have received.
        </p>

        <div className="mt-12">
          {loading ? null : !user ? (
            <div className="max-w-xl" data-reveal="scale">
              <AuthPanel intro="Sign in to see your orders and track them by order ID." />
            </div>
          ) : error ? (
            <p role="alert" className="text-red-300">{error}</p>
          ) : orders === null ? (
            <p className="text-gray-100">Loading your orders…</p>
          ) : orders.length === 0 ? (
            <div data-reveal>
              <p className="text-xl text-gray-100">You haven&apos;t ordered yet.</p>
              <Link to="/buy" className="btn mt-6">Buy JUNO.1</Link>
            </div>
          ) : (
            <ul className="border-b border-line" data-stagger>
              {orders.map((o) => (
                <li key={o.id} className="border-t border-line">
                  <Link
                    to={`/orders/${o.id}`}
                    className="group grid gap-3 py-7 transition-colors hover:bg-white/[0.03] sm:grid-cols-[1.2fr_1fr_auto_auto] sm:items-center sm:gap-6 sm:px-4"
                  >
                    <div>
                      <p className="font-display text-xl font-medium tracking-tight">{o.id}</p>
                      <p className="mt-1 text-gray">Placed {formatDate(o.createdAt)}</p>
                    </div>
                    <p className="text-gray-100">{o.quantity} × JUNO.1</p>
                    <StatusChip status={o.status} />
                    <p className="font-display text-lg sm:text-right">{formatINR(o.totalPaise)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

export default Orders;
