import { LockKeyhole, LockKeyholeOpen, LogOut } from "lucide-react";
import Logo from "../assets/agribank.png";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { useAuth } from "../context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { Button } from "../components/ui/button";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../components/ui/input";
import api from "../lib/axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const FormSchema = z
  .object({
    oldPassword: z
      .string()
      .trim()
      .min(6, { message: "Mật khẩu phải đủ 6 ký tự" }),
    newPassword: z
      .string()
      .trim()
      .min(6, { message: "Mật khẩu phải đủ 6 ký tự" }),
    confirmPassword: z
      .string()
      .trim()
      .min(6, { message: "Mật khẩu xác nhận phải đủ 6 ký tự" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Mật khẩu xác nhận không khớp",
  });

export default function Header() {
  const { logout } = useAuth();
  const { token } = useAuth();
  const navigate = useNavigate();
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  const [showPasswordOld, setShowPasswordOld] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const isAdmin = user?.role === "ADMIN";

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    const formData = {
      oldPassword: data.oldPassword.trim(),
      newPassword: data.newPassword.trim(),
    };
    try {
      const res = await api.post("/auth/update-password", formData);
      toast.success(res.data.message || "Đăng ký thành công");
      logout();
      navigate("/login");
      form.reset();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(
        error?.response.data.message ||
          "Cập nhập mật khẩu thất bại, vui lòng thử lại sau!"
      );
    }
  };

  if (!token) {
    return <></>;
  }

  return (
    <header className="bg-gray-100 shadow p-4 flex sticky top-0 z-50 w-full">
      <div className="flex items-center max-w-7xl w-full mx-auto justify-between">
        <div className="flex items-center gap-2">
          <img
            src={Logo}
            alt="Agribank Logo"
            width={40}
            height={40}
            className="w-10 h-10 object-contain"
          />
          <div className="text-xl font-semibold text-gray-800 flex items-center">
            Agribank
          </div>
        </div>
        {token && (
          <Popover>
            <PopoverTrigger>
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </PopoverTrigger>
            <PopoverContent className="w-fit flex flex-col gap-4">
              <Dialog>
                <DialogTrigger asChild>
                  <div className="flex gap-2 justify-center items-center cursor-pointer">
                    <Avatar>
                      <AvatarImage src="https://github.com/shadcn.png" />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-bold text-[16px]">
                        {user?.fullName ?? ""}
                      </span>
                      <span className="text-sm text-gray-500">
                        {user?.email ?? ""}
                      </span>
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-[500px] bg-white">
                  <DialogHeader>
                    <DialogTitle className="w-[80%]">
                      Thay đổi mật khẩu
                    </DialogTitle>
                    <DialogDescription className="hidden"></DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4">
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="w-full space-y-6"
                      >
                        <FormField
                          control={form.control}
                          name="oldPassword"
                          render={({ field }) => (
                            <FormItem className="relative">
                              <FormLabel>
                                Mật khẩu cũ{" "}
                                <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type={showPasswordOld ? "text" : "password"}
                                  placeholder="Nhập mật khẩu mới ..."
                                  {...field}
                                  className="border rounded p-2 w-full"
                                />
                              </FormControl>
                              <div
                                className="absolute right-2 top-7.5 !p-0 cursor-pointer"
                                onClick={() =>
                                  setShowPasswordOld(!showPasswordOld)
                                }
                              >
                                {showPasswordOld ? (
                                  <LockKeyholeOpen className="w-5 h-5" />
                                ) : (
                                  <LockKeyhole className="w-5 h-5" />
                                )}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem className="relative">
                              <FormLabel>
                                Mật khẩu mới{" "}
                                <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Nhập mật khẩu mới ..."
                                  {...field}
                                  className="border rounded p-2 w-full"
                                />
                              </FormControl>
                              <div
                                className="absolute right-2 top-7.5 !p-0 cursor-pointer"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <LockKeyholeOpen className="w-5 h-5" />
                                ) : (
                                  <LockKeyhole className="w-5 h-5" />
                                )}
                              </div>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem className="relative">
                              <FormLabel>
                                Nhập lại mật khẩu mới{" "}
                                <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Nhập lại password ...."
                                  {...field}
                                  type={
                                    showPasswordConfirm ? "text" : "password"
                                  }
                                />
                              </FormControl>
                              <div
                                className="absolute right-2 top-7.5 !p-0 cursor-pointer"
                                onClick={() =>
                                  setShowPasswordConfirm(!showPasswordConfirm)
                                }
                              >
                                {showPasswordConfirm ? (
                                  <LockKeyholeOpen className="w-5 h-5" />
                                ) : (
                                  <LockKeyhole className="w-5 h-5" />
                                )}
                              </div>
                              <FormMessage />
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
                </DialogContent>
              </Dialog>
              {isAdmin && (
                <div
                  className="cursor-pointer flex items-center gap-4 justify-between"
                  onClick={() => navigate("/register")}
                >
                  <span className="font-semibold">Đăng ký</span>
                </div>
              )}
              <div
                className="cursor-pointer flex items-center gap-4 justify-between"
                onClick={logout}
              >
                <span className="font-semibold">Đăng xuất</span>
                <LogOut className="w-4 h-4 text-red-600" />
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </header>
  );
}
