"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAllContracts,
  ContractViewAllDto,
  softDeleteContract,
} from "@/lib/api/contracts";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function ContractsPage() {
  const [contracts, setContracts] = useState<ContractViewAllDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    getAllContracts()
      .then((data) => {
        if (Array.isArray(data)) {
          setContracts(data);
          setError(null); // reset error nếu có dữ liệu
        } else if (
          typeof data === "string" ||
          Object.prototype.toString.call(data) === "[object String]"
        ) {
          const str = (data as string).trim().toLowerCase();
          if (str === "no data") {
            setContracts([]);
            setError(null); // reset error nếu đúng "no data"
          } else {
            setError("Dữ liệu trả về không hợp lệ");
          }
        } else {
          setError("Dữ liệu trả về không hợp lệ");
        }
      })
      .catch((err: any) => {
        const message = err?.response?.data;
        const status = err?.response?.status;

        const isString =
          typeof message === "string" ||
          Object.prototype.toString.call(message) === "[object String]";

        if (status === 404 && isString) {
          const str = (message as string).trim().toLowerCase();
          if (str === "no data") {
            setContracts([]);
            setError(null); // reset error nếu đúng "no data"
            return;
          }
        }

        setError(err.message || "Đã xảy ra lỗi khi tải hợp đồng");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Search filter
  const filteredContracts = contracts.filter((c) => {
    const s = search.toLowerCase();
    return (
      c.contractCode.toLowerCase().includes(s) ||
      c.contractTitle.toLowerCase().includes(s) ||
      c.buyerName.toLowerCase().includes(s) ||
      (c.deliveryRounds?.toString() ?? "").includes(s) ||
      (c.totalQuantity?.toString() ?? "").includes(s) ||
      (c.totalValue?.toString() ?? "").includes(s) ||
      (c.startDate ?? "").includes(s) ||
      (c.endDate ?? "").includes(s) ||
      c.status.toLowerCase().includes(s)
    );
  });

  // Handlers
  const handleAdd = () => router.push("/dashboard/manager/contracts/create");
  const handleDetail = (id: string) =>
    router.push(`/dashboard/manager/contracts/${id}`);
  const handleEdit = (id: string) =>
    router.push(`/dashboard/manager/contracts/${id}/edit`);
  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await softDeleteContract(deleteId);
      setContracts((prev) => prev.filter((c) => c.contractId !== deleteId));
      setDeleteId(null);
    } catch (err: any) {
      alert(err?.message || "Xoá hợp đồng thất bại");
    } finally {
      setDeleting(false);
    }
  };

  const contractStatusMap: Record<
    string,
    { label: string; className: string }
  > = {
    NotStarted: {
      label: "Chưa bắt đầu",
      className: "bg-gray-200 text-gray-700",
    },
    PreparingDelivery: {
      label: "Chuẩn bị giao",
      className: "bg-blue-100 text-blue-700",
    },
    InProgress: {
      label: "Đang thực hiện",
      className: "bg-yellow-100 text-yellow-800",
    },
    Completed: {
      label: "Hoàn thành",
      className: "bg-green-100 text-green-700",
    },
    Cancelled: { label: "Đã huỷ", className: "bg-red-100 text-red-700" },
    // ... các trạng thái khác nếu có
  };

  return (
    <div className="w-full min-h-screen bg-orange-50 p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Danh sách hợp đồng</CardTitle>
          <Button onClick={handleAdd} className="bg-orange-500 text-white">
            Thêm hợp đồng
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <input
              type="text"
              placeholder="Tìm kiếm theo mã, tiêu đề, bên mua..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded px-3 py-2 w-64 bg-white focus:ring-2 focus:ring-orange-200 outline-none"
            />
          </div>
          {loading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : error && error.toLowerCase() !== "no data" ? (
            <div className="text-red-500 text-center mb-2">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[900px] border rounded-lg bg-white shadow-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã hợp đồng</TableHead>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead>Bên mua</TableHead>
                    <TableHead>Số vòng giao</TableHead>
                    <TableHead>Tổng khối lượng</TableHead>
                    <TableHead>Tổng giá trị</TableHead>
                    <TableHead>Ngày bắt đầu</TableHead>
                    <TableHead>Ngày kết thúc</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-center">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={10}
                        className="text-center text-gray-500"
                      >
                        Không có hợp đồng nào.
                      </TableCell>
                    </TableRow>
                  ) : filteredContracts.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={10}
                        className="text-center text-gray-500"
                      >
                        Không có hợp đồng nào phù hợp.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredContracts.map((contract) => (
                      <TableRow key={contract.contractId}>
                        <TableCell>{contract.contractCode}</TableCell>
                        <TableCell
                          className="max-w-[220px] truncate"
                          title={contract.contractTitle}
                        >
                          {contract.contractTitle}
                        </TableCell>
                        <TableCell
                          className="max-w-[180px] truncate"
                          title={contract.buyerName}
                        >
                          {contract.buyerName}
                        </TableCell>
                        <TableCell>{contract.deliveryRounds ?? "-"}</TableCell>
                        <TableCell>
                          {contract.totalQuantity?.toLocaleString() ?? "-"}
                        </TableCell>
                        <TableCell>
                          {contract.totalValue?.toLocaleString() ?? "-"}
                        </TableCell>
                        <TableCell>{contract.startDate ?? "-"}</TableCell>
                        <TableCell>{contract.endDate ?? "-"}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              contractStatusMap[contract.status]?.className ||
                              "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {contractStatusMap[contract.status]?.label ||
                              contract.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDetail(contract.contractId)}
                            >
                              Chi tiết
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(contract.contractId)}
                            >
                              Sửa
                            </Button>
                            <Dialog
                              open={deleteId === contract.contractId}
                              onOpenChange={(open) =>
                                setDeleteId(open ? contract.contractId : null)
                              }
                            >
                              <DialogTrigger asChild>
                                <Button size="sm" variant="destructive">
                                  Xoá
                                </Button>
                              </DialogTrigger>
                              <DialogContent title="Xác nhận xoá hợp đồng">
                                <DialogHeader>
                                  <DialogTitle className="text-red-600 text-lg font-semibold">
                                    ⚠️ Bạn có chắc chắn muốn xoá hợp đồng này?
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="flex justify-end gap-2 mt-4">
                                  <Button
                                    variant="outline"
                                    onClick={() => setDeleteId(null)}
                                    disabled={deleting}
                                  >
                                    Huỷ
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={handleDelete}
                                    disabled={deleting}
                                  >
                                    {deleting ? "Đang xoá..." : "Xoá"}
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
