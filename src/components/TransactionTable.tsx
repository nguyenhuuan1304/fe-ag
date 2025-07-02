import { useEffect, useState } from "react";
import {
  fetchTransactionsById,
  fetchTransactionsNotYet,
  fetchTransactionsUpdateById,
  GetTransactionsHK,
  reportExcel,
  reportPostInspectionExcel,
  updateTransactionsHKUpdateById,
  updateTransactionsKSVUpdateById,
  uploadTransactionFile,
} from "../services/api";
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
import { Loader2, Pencil } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { toast } from "sonner";

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
  note_censored: string | null;
  note_inspection: string | null;
  remark: string;
  status: string | null;
  tradate: string;
  trref: string;
  updated_at: string | null;
  updated_by: string | null;
  additional_date: string | null;
  document: string;
  censored: boolean;
  post_inspection: boolean;
};

const FormSchema = z.object({
  status: z.string().trim().min(1, { message: "status là bắt buộc" }),
  note: z.string().trim().optional(),
});

const FormSchemaKSV = z.object({
  status: z.string().trim().min(1, { message: "status là bắt buộc" }),
  censored: z.boolean(),
  note: z.string().trim().optional(),
});

const FormSchemaHK = z.object({
  status: z.string().trim().min(1, { message: "status là bắt buộc" }),
  post_inspection: z.boolean(),
  note: z.string().trim().optional(),
});

export default function TransactionTable({
  status = "Chưa bổ sung",
}: {
  status: string;
}) {
  const [data, setData] = useState<Transaction[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [isLoadingExPostInspection, setIsLoadingExPostInspection] =
    useState<boolean>(false);
  const [isLoadingExNotPostInspection, setIsLoadingExNotPostInspection] =
    useState<boolean>(false);
  const [isLoadingEx, setIsLoadingEx] = useState<boolean>(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      status: "",
      note: "",
    },
  });

  const formKSV = useForm<z.infer<typeof FormSchemaKSV>>({
    resolver: zodResolver(FormSchemaKSV),
    defaultValues: {
      status: "",
      censored: false,
      note: "",
    },
  });

  const formHK = useForm<z.infer<typeof FormSchemaHK>>({
    resolver: zodResolver(FormSchemaHK),
    defaultValues: {
      status: "",
      post_inspection: false,
      note: "",
    },
  });

  // Load data with optional custom page & search
  const loadData = async (customPage = page, customSearch = search) => {
    setLoading(true);
    try {
      const res = await fetchTransactionsNotYet(
        customPage,
        10,
        status,
        customSearch
      );
      setData(res.data || []);
      setLastPage(res?.lastPage ?? 1);
    } catch (err) {
      console.error("Fetch failed:", err);
      setData([]);
      setLastPage(1);
    } finally {
      setLoading(false);
    }
  };

  const loadDataHK = async (customPage = page, customSearch = search) => {
    setLoading(true);
    try {
      const res = await GetTransactionsHK(customPage, 10, customSearch);
      setData(res.data || []);
      setLastPage(res?.lastPage ?? 1);
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
    if (user?.role === "GDV_HK") {
      loadDataHK();
    } else {
      loadData();
    }
  }, []);

  // File upload handler
  const handleUpload = async () => {
    if (!file) return;
    try {
      await uploadTransactionFile(file);
      await loadData(1, ""); // reset to page 1 and no search
      setDialogOpen(false);
      setFile(null);
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Tải lên thất bại. Vui lòng thử lại.");
    }
  };
  // Search submit handler
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchInput.trim();
    setSearch(trimmed);
    setPage(1);
    await loadData(1, trimmed);
  };

  // Page change handler
  const handlePageChange = async (newPage: number) => {
    setPage(newPage);
    await loadData(newPage, search);
  };

  // Open edit modal and load transaction data
  const handleEditTransaction = async (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setEditDialogOpen(true);
    try {
      const res = await fetchTransactionsById(transaction.id);
      form.reset({
        status: res.status || "",
        note: res.note || "",
      });
      formKSV.reset({
        status: res.status || "",
        censored: res.censored || false,
        note: res.note_censored || "",
      });
      formHK.reset({
        status: res.status || "",
        post_inspection: res.post_inspection || false,
        note: res.note_inspection || "",
      });
    } catch (err) {
      console.error("Fetch failed:", err);
    }
  };

  // Submit edit form
  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    if (!selectedTransaction) return;
    try {
      await fetchTransactionsUpdateById(
        selectedTransaction.id,
        data.status,
        data.note || ""
      );
      toast.success("Cập nhật thành công!");
      setEditDialogOpen(false);
      setSelectedTransaction(null);
      await loadData(page, search);
    } catch (error) {
      console.error("Error updating transaction:", error);
    }
  };

  const onSubmitKSV = async (data: z.infer<typeof FormSchemaKSV>) => {
    if (!selectedTransaction) return;
    try {
      await updateTransactionsKSVUpdateById(
        selectedTransaction.id,
        data.status,
        data.censored,
        data.note || ""
      );
      toast.success("Cập nhật thành công!");
      setEditDialogOpen(false);
      setSelectedTransaction(null);
      await loadData(page, search);
    } catch (error) {
      console.error("Error updating transaction:", error);
    }
  };

  const onSubmitHK = async (data: z.infer<typeof FormSchemaHK>) => {
    if (!selectedTransaction) return;
    try {
      await updateTransactionsHKUpdateById(
        selectedTransaction.id,
        data.status,
        data.post_inspection,
        data.note || ""
      );
      toast.success("Cập nhật thành công!");
      setEditDialogOpen(false);
      setSelectedTransaction(null);
      await loadDataHK(page, search);
    } catch (error) {
      console.error("Error updating transaction:", error);
    }
  };

  const handleEx = async () => {
    setIsLoadingEx(true);
    try {
      const response = await reportExcel(status);

      // Create a Blob from the response data
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Create a temporary URL for the Blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link element to trigger the download
      const link = document.createElement("a");
      link.href = url;
      const now = new Date();
      const formattedDate = now
        .toLocaleDateString("vi-VN")
        .split("/")
        .join("-");
      link.download = `report-${status}-${formattedDate}.xlsx`;
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setIsLoadingEx(false);
    }
  };

  const handleExcelPostInspection = async (postInspection: boolean) => {
    if (postInspection) {
      setIsLoadingExPostInspection(true);
    } else {
      setIsLoadingExNotPostInspection(true);
    }
    try {
      const response = await reportPostInspectionExcel(postInspection);

      // Create a Blob from the response data
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Create a temporary URL for the Blob
      const url = window.URL.createObjectURL(blob);
      const postInspectionText = postInspection
        ? "Đã hậu kiểm"
        : "Chưa hậu kiểm";

      // Create a temporary link element to trigger the download
      const link = document.createElement("a");
      link.href = url;
      const now = new Date();
      const formattedDate = now
        .toLocaleDateString("vi-VN")
        .split("/")
        .join("-");
      link.download = `report-${postInspectionText}-${formattedDate}.xlsx`;
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setIsLoadingExPostInspection(false);
      setIsLoadingExNotPostInspection(false);
    }
  };

  return (
    <div className="overflow-auto w-full mx-auto space-y-4">
      <div className="flex justify-between w-full">
        <div className="flex items-center gap-4">
          <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md">
            <Input
              placeholder="Tìm theo tên khách hàng..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <Button
              className="w-[200px] bg-gray-100"
              type="submit"
              // disabled={searchInput.trim() === ""}
            >
              Tìm kiếm
            </Button>
          </form>
          {status !== "Đã bổ sung" && (
            <Button onClick={handleEx} className="bg-gray-100">
              {isLoadingEx ? (
                <div className="flex items-center">
                  <Loader2 className="animate-spin h-4 w-4" />
                  <span className="ml-2">Đang xuất excel...</span>
                </div>
              ) : (
                "Xuất excel"
              )}
            </Button>
          )}
          {["ADMIN", "GDV_HK"].includes(user?.role) &&
            status === "Đã bổ sung" && (
              <div className="flex gap-2">
                <Button
                  onClick={() => handleExcelPostInspection(true)}
                  className="bg-gray-100"
                >
                  {isLoadingExPostInspection ? (
                    <div className="flex items-center">
                      <Loader2 className="animate-spin h-4 w-4" />
                      <span className="ml-2">Đang xuất excel...</span>
                    </div>
                  ) : (
                    "Xuất excel hậu kiểm"
                  )}
                </Button>
                <Button
                  onClick={() => handleExcelPostInspection(false)}
                  className="bg-gray-100"
                >
                  {isLoadingExNotPostInspection ? (
                    <div className="flex items-center">
                      <Loader2 className="animate-spin h-4 w-4" />
                      <span className="ml-2">Đang xuất excel...</span>
                    </div>
                  ) : (
                    "Xuất excel chưa hậu kiểm"
                  )}
                </Button>
              </div>
            )}
        </div>
        {["ADMIN", "GDV_TTQT"].includes(user?.role) &&
          status === "Chưa bổ sung" && (
            <div className="flex gap-2">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="w-[200px] !bg-[#F97316] text-white"
                    onClick={() => setDialogOpen(true)}
                  >
                    Upload IPCAS Excel
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-white">
                  <DialogHeader>
                    <DialogTitle>Upload IPCAS Excel</DialogTitle>
                    <DialogDescription className="hidden"></DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4">
                    <Input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="w-full cursor-pointer"
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={handleUpload}
                        className="!bg-[#F97316] text-white"
                      >
                        Tải lên
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
      </div>

      {loading ? (
        <p>Vui lòng chờ...</p>
      ) : (
        <>
          <table className="min-w-full text-sm border border-gray-200 rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-2">Số giao dịch</th>
                <th className="text-left p-2">Mã khách hàng</th>
                <th className="text-left p-2">Tên khách hàng</th>
                <th className="text-left p-2">Số tiền</th>
                <th className="text-left p-2">Loại tiền</th>
                <th className="text-left p-2">Ngày giao dịch</th>
                <th className="text-left p-2 w-[200px]">Remark</th>
                <th className="text-left p-2">
                  Chứng từ
                  <br /> cần bổ sung
                </th>
                {user?.role === "GDV_TTQT" && (
                  <th className="text-left p-2">Trạng thái</th>
                )}
                {user?.role === "KSV_TTQT" && (
                  <th className="text-left p-2">Kiểm duyệt</th>
                )}
                {user?.role === "GDV_HK" && (
                  <th className="text-left p-2">Hậu duyệt</th>
                )}
                <th className="text-left p-2 whitespace-normal">
                  Ngày nhận <br /> hàng dự kiến
                </th>
                <th className="text-left p-2 whitespace-normal">
                  Ngày bổ sung
                  <br /> chứng từ dự kiến
                </th>
                <th className="text-left p-2">Ghi chú</th>
                <th className="text-left p-2"></th>
              </tr>
            </thead>
            <tbody>
              {data.map((tx) => (
                <tr key={tx.id} className="border-b border-gray-200">
                  <td className="p-2">{tx.trref}</td>
                  <td className="p-2">{tx.custno}</td>
                  <td className="p-2">{tx.custnm}</td>
                  <td className="p-2">{tx.amount}</td>
                  <td className="p-2">{tx.currency}</td>
                  <td className="p-2">{tx.tradate}</td>
                  <td className="p-2 w-[200px]">{tx.remark}</td>
                  <td className="p-2">{tx.document}</td>
                  {user?.role === "GDV_TTQT" && (
                    <td className="p-2 w-fit">
                      <div
                        className={`px-2 py-1 rounded-2xl w-fit ${
                          tx.status === "Chưa bổ sung"
                            ? "bg-red-500 text-white"
                            : "bg-green-500 text-white"
                        }`}
                      >
                        {tx.status ?? "-"}
                      </div>
                    </td>
                  )}
                  {user?.role === "KSV_TTQT" && (
                    <td className="p-2">
                      <div
                        className={`px-2 py-1 rounded-2xl w-fit ${
                          tx.censored
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {tx.censored ? "Đã kiểm duyệt" : "Chưa kiểm duyệt"}
                      </div>
                    </td>
                  )}
                  {user?.role === "GDV_HK" && (
                    <td className="p-2">
                      <div
                        className={`px-2 py-1 rounded-2xl w-fit ${
                          tx.post_inspection
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {tx.post_inspection ? "Đã hậu kiểm" : "Chưa hậu kiểm"}
                      </div>
                    </td>
                  )}
                  <td className="p-2">{tx.expected_declaration_date ?? "-"}</td>
                  <td className="p-2">{tx.additional_date}</td>
                  {user?.role === "GDV_TTQT" && (
                    <td className="p-2">{tx.note ?? "-"}</td>
                  )}
                  {user?.role === "KSV_TTQT" && (
                    <td className="p-2">{tx.note_censored ?? "-"}</td>
                  )}
                  {user?.role === "GDV_HK" && (
                    <td className="p-2">{tx.note_inspection ?? "-"}</td>
                  )}
                  <td className="p-2">
                    <Dialog
                      open={editDialogOpen}
                      onOpenChange={setEditDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <div
                          className="cursor-pointer hover:text-blue-500"
                          onClick={() => {
                            handleEditTransaction(tx);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-[500px] bg-white">
                        <DialogHeader>
                          <DialogTitle className="w-[80%]">
                            {selectedTransaction?.custnm}
                          </DialogTitle>
                          <DialogDescription className="flex flex-col mt-6 gap-4"></DialogDescription>
                        </DialogHeader>
                        {["ADMIN", "GDV_TTQT"].includes(user?.role) && (
                          <div className="grid gap-4">
                            <Form {...form}>
                              <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="w-full space-y-6"
                              >
                                <FormField
                                  control={form.control}
                                  name="status"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>
                                        Status{" "}
                                        <span className="text-red-500">*</span>
                                      </FormLabel>
                                      <FormControl>
                                        <Select
                                          value={field.value}
                                          onValueChange={(value) => {
                                            field.onChange(value);
                                          }}
                                        >
                                          <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Chọn trạng thái" />
                                          </SelectTrigger>
                                          <SelectContent className="bg-white">
                                            <SelectItem value="Chưa bổ sung">
                                              Chưa bổ sung
                                            </SelectItem>
                                            <SelectItem value="Đã bổ sung">
                                              Đã bổ sung
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="note"
                                  render={({ field }) => (
                                    <FormItem className="relative">
                                      <FormLabel>Note</FormLabel>
                                      <FormControl>
                                        <Textarea
                                          {...field}
                                          placeholder="Nhập ghi chú ..."
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                                <div className="flex justify-center items-center">
                                  <Button type="submit" className="bg-gray-200">
                                    Lưu
                                  </Button>
                                </div>
                              </form>
                            </Form>
                          </div>
                        )}
                        {user?.role === "KSV_TTQT" && (
                          <div className="grid gap-4">
                            <Form {...formKSV}>
                              <form
                                onSubmit={formKSV.handleSubmit(onSubmitKSV)}
                                className="w-full space-y-6"
                              >
                                <FormField
                                  control={formKSV.control}
                                  name="censored"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>
                                        Kiểm duyệt{" "}
                                        <span className="text-red-500">*</span>
                                      </FormLabel>
                                      <FormControl>
                                        <Select
                                          value={
                                            field.value
                                              ? "Đã kiểm duyệt"
                                              : "Chưa kiểm duyệt"
                                          }
                                          onValueChange={(value) => {
                                            field.onChange(
                                              value === "Đã kiểm duyệt"
                                            );
                                          }}
                                        >
                                          <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Chọn trạng thái" />
                                          </SelectTrigger>
                                          <SelectContent className="bg-white">
                                            <SelectItem value="Chưa kiểm duyệt">
                                              Chưa kiểm duyệt
                                            </SelectItem>
                                            <SelectItem value="Đã kiểm duyệt">
                                              Đã kiểm duyệt
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={formKSV.control}
                                  name="status"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>
                                        Status{" "}
                                        <span className="text-red-500">*</span>
                                      </FormLabel>
                                      <FormControl>
                                        <Select
                                          value={field.value}
                                          onValueChange={(value) => {
                                            field.onChange(value);
                                          }}
                                        >
                                          <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Chọn trạng thái" />
                                          </SelectTrigger>
                                          <SelectContent className="bg-white">
                                            <SelectItem value="Chưa bổ sung">
                                              Chưa bổ sung
                                            </SelectItem>
                                            <SelectItem value="Đã bổ sung">
                                              Đã bổ sung
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={formKSV.control}
                                  name="note"
                                  render={({ field }) => (
                                    <FormItem className="relative">
                                      <FormLabel>Note</FormLabel>
                                      <FormControl>
                                        <Textarea
                                          {...field}
                                          placeholder="Nhập ghi chú ..."
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                                <div className="flex justify-center items-center">
                                  <Button type="submit" className="bg-gray-200">
                                    Lưu
                                  </Button>
                                </div>
                              </form>
                            </Form>
                          </div>
                        )}
                        {user?.role === "GDV_HK" && (
                          <div className="grid gap-4">
                            <Form {...formHK}>
                              <form
                                onSubmit={formHK.handleSubmit(onSubmitHK)}
                                className="w-full space-y-6"
                              >
                                <FormField
                                  control={formHK.control}
                                  name="post_inspection"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>
                                        Hậu kiểm{" "}
                                        <span className="text-red-500">*</span>
                                      </FormLabel>
                                      <FormControl>
                                        <Select
                                          value={
                                            field.value
                                              ? "Đã hậu kiểm"
                                              : "Chưa hậu kiểm"
                                          }
                                          onValueChange={(value) => {
                                            field.onChange(
                                              value === "Đã hậu kiểm"
                                            );
                                          }}
                                        >
                                          <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Chọn trạng thái" />
                                          </SelectTrigger>
                                          <SelectContent className="bg-white">
                                            <SelectItem value="Chưa hậu kiểm">
                                              Chưa hậu kiểm
                                            </SelectItem>
                                            <SelectItem value="Đã hậu kiểm">
                                              Đã hậu kiểm
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={formHK.control}
                                  name="status"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>
                                        Status{" "}
                                        <span className="text-red-500">*</span>
                                      </FormLabel>
                                      <FormControl>
                                        <Select
                                          value={field.value}
                                          onValueChange={(value) => {
                                            field.onChange(value);
                                          }}
                                          disabled={true}
                                        >
                                          <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Chọn trạng thái" />
                                          </SelectTrigger>
                                          <SelectContent className="bg-white">
                                            <SelectItem value="Chưa bổ sung">
                                              Chưa bổ sung
                                            </SelectItem>
                                            <SelectItem value="Đã bổ sung">
                                              Đã bổ sung
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={formHK.control}
                                  name="note"
                                  render={({ field }) => (
                                    <FormItem className="relative">
                                      <FormLabel>Note</FormLabel>
                                      <FormControl>
                                        <Textarea
                                          {...field}
                                          placeholder="Nhập ghi chú ..."
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                                <div className="flex justify-center items-center">
                                  <Button type="submit" className="bg-gray-200">
                                    Lưu
                                  </Button>
                                </div>
                              </form>
                            </Form>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={13} className="text-center p-4 text-gray-500">
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
