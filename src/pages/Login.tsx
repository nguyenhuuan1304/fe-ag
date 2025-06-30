import api from "../lib/axios";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole, LockKeyholeOpen } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

const FormSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Vui lòng nhập đúng định dạng email" }),
  password: z.string().trim().min(6, { message: "Mật khẩu phải đủ 6 ký tự" }),
});

export default function LoginPage() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const formLogin = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    try {
      const res = await api.post("/auth/login", data);
      login(res.data.access_token, res.data.refresh_token); // Pass both tokens
      // lưu user vào localStorage
      localStorage.setItem("user", JSON.stringify(res.data.user));
      toast.success("Đăng nhập thành công");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Đăng nhập thất bại, vui lòng thử lại sau"
      );
    }
  };

  return (
    <div className="max-w-md mx-auto mt-40 p-6 border rounded space-y-4 w-[500px]">
      <h2 className="text-xl font-semibold">Đăng nhập</h2>
      <Form {...formLogin}>
        <form
          onSubmit={formLogin.handleSubmit(onSubmit)}
          className="w-full space-y-6"
        >
          <FormField
            control={formLogin.control}
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
            control={formLogin.control}
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
          <div className="flex justify-center items-center">
            <Button type="submit">Đăng Nhập</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
