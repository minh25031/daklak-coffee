"use client";

import { AppToast } from "@/components/ui/AppToast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  getAllAvailableProcurementPlans,
  ProcurementPlan,
} from "@/lib/api/procurementPlans";
import { getErrorMessage } from "@/lib/utils";
import { Search } from "lucide-react";
import Link from "next/dist/client/link";
import { useEffect, useState } from "react";
import { differenceInCalendarDays } from "date-fns";

export default function MarketplacePage() {
  const [plans, setPlans] = useState<ProcurementPlan[]>([]);
  const [loading, setLoading] = useState(true);

  // Fake fetching data - replace by your real API endpoint
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const data = await getAllAvailableProcurementPlans().catch((error) => {
      AppToast.error(getErrorMessage(error));
      return [];
    });
    console.log("Fetched Procurement Plans:", data);
    setPlans(data);
    setLoading(false);
  };

  const filteredPlans = plans.filter(
    (plan) => differenceInCalendarDays(new Date(plan.endDate), new Date()) > 0
  );

  if (loading) {
    return <p className='text-center py-20'>Đang tải dữ liệu...</p>;
  }

  return (
    <div className='min-h-screen bg-[#fefaf4] py-8'>
      <div className='max-w-7xl mx-auto px-4 md:px-6 flex justify-center'>
        <div className='flex w-full max-w-[1200px] gap-8'>

          <aside className='w-64 flex flex-col space-y-4'>
            <div className='bg-white rounded-xl shadow-sm p-4 space-y-4'>
              <h2 className='text-sm font-medium text-gray-700'>
                Tìm kiếm kế hoạch thu mua
              </h2>
              <div className='relative'>
                <Input
                  placeholder='Tìm kiếm...'
                  //value={search}
                  //onChange={(e) => setSearch(e.target.value)}
                  className='pr-10'
                />
                <Search className='absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
              </div>
              <div className='flex justify-end text-sm'>
                <Button className='w-full bg-[#FD7622] hover:bg-[#d74f0f] text-white font-medium text-sm'>
                  Search
                </Button>
              </div>
            </div>

            <div className='bg-white p-4 rounded shadow'>
              {/* component Filter sau này */}
              <p className='text-gray-600'>Filter (đang phát triển)</p>
            </div>
          </aside>
          <main className='flex-1'>

            {filteredPlans.length === 0 && <p>Chưa có kế hoạch thu mua nào.</p>}

            <div className='space-y-5'>
              {filteredPlans.map((plan) => (
                <Card
                  key={plan.planId}
                  className='max-w-4xl mx-auto bg-white p-6 shadow hover:shadow-md transition'
                >
                  <div className='flex justify-between mb-3'>
                    <div>
                      <h3 className='text-xl font-semibold text-orange-600'>
                        {plan.title}
                      </h3>
                      <p className='text-gray-600 mt-1 line-clamp-3 break-words'>
                        {plan.description}
                      </p>
                    </div>
                    <div className='w-48 flex flex-col space-y-2 text-right text-sm text-gray-700 flex-shrink-0'>
                      <p>
                        <span className='font-semibold'>Sản lượng:</span>{" "}
                        {plan.totalQuantity} kg
                      </p>
                      <p>
                        <span className='font-semibold'>Hạn đăng ký còn lại:</span>{" "}
                        {Math.max(
                          differenceInCalendarDays(
                            new Date(plan.endDate),
                            new Date()
                          ),
                          0
                        )}{" "}
                        ngày
                      </p>
                      {/* <p>
                        <span className='font-semibold'>Trạng thái:</span>{" "}
                        <span
                          className={
                            plan.status === "Open"
                              ? "text-green-600 font-semibold"
                              : "text-gray-500"
                          }
                        >
                          {plan.status}
                        </span>
                      </p> */}
                      <p>
                        <span className='font-semibold'>Đã đăng ký:</span>{" "}
                        {plan.progressPercentage.toFixed(2)}%
                      </p>
                    </div>
                  </div>

                  {/* Thông tin doanh nghiệp */}
                  {/* <div className='mb-4 border-t border-gray-200 pt-4'>
                    <h4 className='font-semibold text-lg'>Doanh nghiệp</h4>
                    <p className='text-orange-700 font-medium'>
                      {plan.createdBy.companyName}
                    </p>
                    <p>{plan.createdBy.companyAddress}</p>
                    {plan.createdBy.website && (
                      <Link
                        href={plan.createdBy.website}
                        target='_blank'
                        className='text-blue-600 hover:underline'
                      >
                        Website
                      </Link>
                    )}
                  </div> */}

                  {/* Chi tiết kế hoạch theo loại cà phê */}
                  <div>
                    <h4 className='font-semibold text-lg mb-2'>
                      Chi tiết kế hoạch
                    </h4>
                    <table className='w-full text-left border-collapse'>
                      <thead className='bg-gray-100 text-gray-700 font-medium'>
                        <tr>
                          <th className='border-b border-gray-300 px-3 py-2'>
                            Loại cà phê
                          </th>
                          <th className='border-b border-gray-300 px-3 py-2'>
                            Phương pháp sơ chế
                          </th>
                          <th className='border-b border-gray-300 px-3 py-2'>
                            Sản lượng (kg)
                          </th>
                          <th className='border-b border-gray-300 px-3 py-2'>
                            Khu vực thu mua
                          </th>
                          <th className='border-b border-gray-300 px-3 py-2'>
                            Giá (VNĐ/kg)
                          </th>
                          <th className='border-b border-gray-300 px-3 py-2'>
                            Ghi chú
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {plan.procurementPlansDetails.map((detail) => (
                          <tr
                            key={detail.planDetailsId}
                            className='border-t hover:bg-gray-50'
                          >
                            <td className='px-3 py-2'>
                              {detail.coffeeType?.typeName}
                            </td>
                            <td className='px-3 py-2'>
                              {detail.processingMethodName}
                            </td>
                            <td className='px-3 py-2'>
                              {detail.targetQuantity}
                            </td>
                            <td className='px-3 py-2'>{detail.targetRegion}</td>
                            <td className='px-3 py-2'>
                              {detail.minPriceRange?.toLocaleString()} -{" "}
                              {detail.maxPriceRange?.toLocaleString()}
                            </td>
                            <td className='px-3 py-2'>{detail.note}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Nút xem chi tiết (dẫn đến trang chi tiết kế hoạch) */}
                  <div className='mt-4 text-right'>
                    <Link
                      href={`/marketplace/${plan.planId}`}
                      className='inline-block bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md transition'
                    >
                      Xem chi tiết
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
