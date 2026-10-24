import { STATUS_LABEL } from "../../constants/shop";
import type { OrderStatus } from "../../constants/shop";

const tone: Record<OrderStatus, string> = {
  pending_payment: "border-amber-300/50 text-amber-200",
  payment_failed: "border-red-400/50 text-red-300",
  paid: "border-cap/60 text-cap",
  packed: "border-cap/60 text-cap",
  shipped: "border-sky-300/60 text-sky-200",
  delivered: "border-emerald-300/60 text-emerald-200",
  cancelled: "border-white/30 text-gray-100",
};

function StatusChip({ status }: { status: OrderStatus }): React.ReactElement {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-sm font-medium ${tone[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

export default StatusChip;
