

export async function getAllOrders() {
  const token = localStorage.getItem('token');

  const res = await fetch('https://localhost:7163/api/Orders', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || 'Không lấy được danh sách đơn hàng.');
  }

  const contentType = res.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    return [];
  }

  return await res.json(); // ✅ Trả danh sách Order
}

export async function getOrderItemsByOrderId(orderId: string) {
  const token = localStorage.getItem('token');

  const res = await fetch(`https://localhost:7163/api/Orders/${orderId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || 'Không lấy được chi tiết đơn hàng.');
  }

  const contentType = res.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    return [];
  }

  const orderDetail = await res.json();
  return orderDetail.orderItems || []; // ✅ Trả về danh sách orderItem trong đơn hàng
}
