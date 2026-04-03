import { CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface OrderSuccessProps {
  orderId: string;
  orderCode: string;
}
export function OrderSuccess({ orderId, orderCode }: OrderSuccessProps) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
        <CheckCircle2 size={40} className="text-emerald-600" />
      </div>
      <h2 className="mb-2 text-2xl font-bold">Đặt hàng thành công!</h2>
      <p className="text-sm text-muted-foreground mb-1">Mã đơn hàng của bạn:</p>
      <p className="mb-6 text-lg font-bold text-primary">{orderCode}</p>
      <p className="mb-8 text-sm text-muted-foreground max-w-sm">
        Chúng tôi sẽ xác nhận đơn hàng trong thời gian sớm nhất. Bạn có thể theo
        dõi trạng thái đơn hàng trong mục "Đơn hàng của tôi".
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => navigate(`/orders/${orderId}`)}
          className="rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
        >
          Xem đơn hàng
        </button>
        <button
          onClick={() => navigate("/shop")}
          className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
        >
          Tiếp tục mua sắm
        </button>
      </div>
    </div>
  );
}
