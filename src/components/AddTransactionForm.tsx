import { useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "../lib/utils";
import { addTransaction } from "../services/api";
import { toast } from "sonner";

const FormSchema = z.object({
  trref: z.string({ required_error: "Mã giao dịch là trường bắt buộc." }),
  custno: z.string({ required_error: "Mã khách hàng là trường bắt buộc." }),
  custnm: z.string({ required_error: "Tên khách hàng là trường bắt buộc." }),
  amount: z
    .string({ required_error: "Số tiền là trường bắt buộc." })
    .min(1, { message: "Số tiền là bắt buộc" }),
  currency: z.string({ required_error: "Loại tiền tệ là trường bắt buộc." }),
  tradate: z.date({ required_error: "Ngày Bắt Đầu là trường bắt buộc." }),
  remark: z.string({ required_error: "Remark là trường bắt buộc." }),
  document: z.string({
    required_error: "Chứng từ cần bổ sung là trường bắt buộc.",
  }),
  bencust: z.string({
    required_error: "Người hưởng thụ là trường bắt buộc.",
  }),
  esdate: z.date({
    required_error: "Ngày nhận hàng dự kiến là trường bắt buộc.",
  }),
  note: z.string().optional(),
});

export function AddTransactionForm({ reloadData }: { reloadData: () => void }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const onSubmit =  async (data: z.infer<typeof FormSchema>) => {
    // Logic to save the transaction
    const formatDateUTC = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const payload = {
      ...data,
      note: data.note ?? "",
      tradate: formatDateUTC(data.tradate),
      esdate: formatDateUTC(data.esdate),
    };

    await addTransaction(payload).then(() => {
      toast.success("Thêm giao dịch thành công");
      setDialogOpen(false);
      reloadData();
      form.reset();
    }).catch((error) => {
      console.error("Error adding transaction:", error);
      toast.error("Thêm giao dịch thất bại. Vui lòng thử lại sau.");
    });
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button
          className="w-[120px] !bg-[#af1b3f] text-white"
          onClick={() => setDialogOpen(true)}
        >
          Thêm mới
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] bg-white">
        <DialogHeader>
          <DialogTitle>Thêm mới giao dịch</DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-6"
          >
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="trref"
                render={({ field }) => (
                  <FormItem className="w-1/2">
                    <FormLabel>*Mã giao dịch</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nhập mã giao dịch ..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="custno"
                render={({ field }) => (
                  <FormItem className="w-1/2">
                    <FormLabel>*Mã khách hàng</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nhập mã khách hàng ..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="custnm"
                render={({ field }) => (
                  <FormItem className="w-1/2">
                    <FormLabel>*Tên khách hàng</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nhập tên khách hàng ..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem className="w-1/2">
                    <FormLabel>*Số tiền</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        placeholder="Nhập số tiền ..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem className="w-1/2">
                    <FormLabel>*Loại tiền tệ</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nhập loại tiền tệ ..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tradate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>*Ngày giao dịch</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            className={cn(
                              "w-[316px] border !border-gray-200 !pl-3 text-left font-normal !h-[36px] !text-[14px]",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span className="text-[14px] text-gray-500">
                                Chọn ngày ...
                              </span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          captionLayout="dropdown"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="remark"
                render={({ field }) => (
                  <FormItem className="w-1/2">
                    <FormLabel>*Remark</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nhập remark ..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="document"
                render={({ field }) => (
                  <FormItem className="w-1/2">
                    <FormLabel>*Chứng từ cần bổ sung</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nhập chứng từ ..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="bencust"
                render={({ field }) => (
                  <FormItem className="w-1/2">
                    <FormLabel>*Người hưởng thụ</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Nhập người hưởng thụ ..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="esdate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>*Ngày nhận hàng dự kiến</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            className={cn(
                              "w-[316px] border !border-gray-200 !pl-3 text-left font-normal !h-[36px] !text-[14px]",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span className="text-[14px] text-gray-500">
                                Chọn ngày ...
                              </span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          captionLayout="dropdown"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem className="relative">
                  <FormLabel>Note</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Nhập ghi chú ..." />
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
      </DialogContent>
    </Dialog>
  );
}
