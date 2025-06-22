import api from "../lib/axios";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
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
import { LockKeyhole, LockKeyholeOpen } from "lucide-react";
import { toast } from "sonner";

const FormSchema = z
  .object({
    email: z
      .string()
      .trim()
      .email({ message: "Vui lòng nhập đúng định dạng email" }),
    firstName: z.string().trim().min(1, { message: "Họ không được để trống" }),
    lastName: z.string().trim().min(1, { message: "Tên không được để trống" }),
    password: z.string().trim().min(6, { message: "Mật khẩu phải đủ 6 ký tự" }),
    confirmPassword: z
      .string()
      .trim()
      .min(6, { message: "Mật khẩu xác nhận phải đủ 6 ký tự" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Mật khẩu xác nhận không khớp",
  });

export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const formRegister = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    const form = {
      email: data.email.trim(),
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      password: data.password.trim(),
    };
    try {
      await api.post("/auth/register", form);
      toast.success("Đăng ký thành công");
      navigate("/login");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(
        error?.response.data.message ||
          "Đăng ký thất bại, vui lòng thử lại sau!"
      );
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 border rounded space-y-4 w-[500px]">
      <h2 className="text-xl font-semibold">Đăng ký tài khoản</h2>
      <Form {...formRegister}>
        <form
          onSubmit={formRegister.handleSubmit(onSubmit)}
          className="w-full space-y-6"
        >
          <FormField
            control={formRegister.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nhập email ...."
                    {...field}
                    type="email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={formRegister.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên đầu tiên</FormLabel>
                <FormControl>
                  <Input placeholder="Nhập đầu tiên ...." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={formRegister.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Họ</FormLabel>
                <FormControl>
                  <Input placeholder="Nhập Họ ...." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={formRegister.control}
            name="password"
            render={({ field }) => (
              <FormItem className="relative">
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nhập password ...."
                    {...field}
                    type={showPassword ? "text" : "password"}
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
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={formRegister.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="relative">
                <FormLabel>confirmPassword</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nhập lại password ...."
                    {...field}
                    type={showPasswordConfirm ? "text" : "password"}
                  />
                </FormControl>
                <div
                  className="absolute right-2 top-7.5 !p-0 cursor-pointer"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
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
          <span>
            Bạn đã có tài khoản: <a href="/login">Login?</a>
          </span>
          <div className="flex justify-center items-center mt-6">
            <Button type="submit">Đăng Ký</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
