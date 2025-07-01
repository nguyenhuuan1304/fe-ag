import { useEffect, useState } from "react";
import { fetchCustomer, fetchCustomersTransactionsSentEmail, uploadCustomerFile } from "../services/api";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

type Transaction = {
  amount: string;
  bencust: string;
  contract_number: string | null;
  created_at: string;
  currency: string;
  custnm: string;
  custno: string;
  expected_declaration_date: string | null;
  id: number;
  is_document_added: boolean;
  note: string | null;
  remark: string;
  status: string | null;
  tradate: string;
  trref: string;
  updated_at: string | null;
  updated_by: string | null;
};

type CustomerResponse = {
  transactions: Transaction[];
  contact_person: string;
  custno: string;
  customer_name: string;
  email: string;
  id: number;
  phone_number: string;
};

export default function CustomerTable({ isSendEmail = false }: { isSendEmail?: boolean }) {
  const [data, setData] = useState<CustomerResponse[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [dialogOpenEmail, setDialogOpenEmail] = useState(false);
  const [fileEmail, setFileEmail] = useState<File | null>(null);

  const loadDataCustomer = async (pageNumber: number = 1, searchInput: string = '') => {
    try {
      const res = isSendEmail
        ? await fetchCustomersTransactionsSentEmail(
            pageNumber,
            10,
            isSendEmail,
            searchInput
          )
        : await fetchCustomer(pageNumber, 10, searchInput);
      setData(res.customers || []);
      setLastPage(res.meta?.lastPage ?? 1);
    } catch (err) {
      console.error("Fetch failed:", err);
      setData([]);
      setLastPage(1);
    } finally {
      setLoading(false);
    }
  };

  // Initial load (only once)
  useEffect(() => {
    loadDataCustomer();
  }, []);

  // File upload handler
  const handleUploadEmail = async () => {
    if (!fileEmail) return;
    try {
      await uploadCustomerFile(fileEmail);
      await loadDataCustomer();
      setDialogOpenEmail(false);
      setFileEmail(null);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  // Search submit handler
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    await loadDataCustomer(1, searchInput);
  };

  // Page change handler
  const handlePageChange = async (newPage: number) => {
    setPage(newPage);
    await loadDataCustomer(newPage, searchInput);
  };

  return (
    <div className="overflow-auto w-full mx-auto space-y-4">
      <div className="flex justify-between w-full">
        <div className="flex items-center gap-4">
          <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md">
            <Input
              placeholder="Tìm theo tên khách hàng..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value.trim())}
            />
            <Button className="w-[200px] bg-gray-100" type="submit">
              Tìm kiếm
            </Button>
          </form>
        </div>
        <div></div>
        <div className="flex gap-2">
          <Dialog open={dialogOpenEmail} onOpenChange={setDialogOpenEmail}>
            <DialogTrigger asChild>
              <Button
                className="w-[200px] !bg-[#F97316] text-white"
                onClick={() => setDialogOpenEmail(true)}
              >
                Upload Email Excel
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white">
              <DialogHeader>
                <DialogTitle>Upload Email Excel</DialogTitle>
                <DialogDescription className="hidden"></DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <Input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setFileEmail(e.target.files?.[0] || null)}
                  className="w-full cursor-pointer"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleUploadEmail}
                    className="!bg-[#F97316] text-white"
                  >
                    Tải lên
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <p>Vui lòng chờ...</p>
      ) : (
        <>
          <table className="min-w-full text-sm border border-gray-200 rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-2">Mã khách hàng</th>
                <th className="text-left p-2">Tên khách hàng</th>
                <th className="text-left p-2">Tên người liên hệ</th>
                <th className="text-left p-2">email</th>
              </tr>
            </thead>
            <tbody>
              {data.map((tx) => (
                <tr key={tx.id} className="border-b border-gray-200">
                  <td className="p-2">{tx.custno}</td>
                  <td className="p-2">{tx.contact_person}</td>
                  <td className="p-2">{tx.contact_person}</td>
                  <td className="p-2">{tx.email}</td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center p-4 text-gray-500">
                    Không có dữ liệu khách hàng.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {data.length > 0 && (
            <Pagination className="mt-4">
              <PaginationContent className="flex gap-2 items-center">
                <PaginationItem>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(Math.max(1, page - 1))}
                    disabled={page === 1}
                  >
                    <PaginationPrevious />
                  </Button>
                </PaginationItem>
                <span className="text-sm">
                  Trang {page} / {lastPage}
                </span>
                <PaginationItem>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handlePageChange(Math.min(lastPage, page + 1))
                    }
                    disabled={page === lastPage}
                  >
                    <PaginationNext />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
}
