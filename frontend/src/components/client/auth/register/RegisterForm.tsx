import { useState } from "react";
import {
  Loader2,
  ArrowRight,
  Mail,
  ShoppingBag,
  CaseSensitive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PasswordInput } from "@/components/client/auth/PasswordInput";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "sonner";

const VITE_API_URL = import.meta.env.VITE_API_URL;

const userSchema = z.object({
  name: z
    .string()
    .max(50)
    .nonempty("Tên không được để trống, Vui lòng nhập tên"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

type UserFormData = z.infer<typeof userSchema>;

export function RegisterForm() {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  const onSubmit = async (data: UserFormData) => {
    try {
      setLoading(true);

      await axios.post(`${VITE_API_URL}/api/auth/register`, data);
      toast.success("Đăng ký thành công!");

      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
    } catch (error: unknown) {
      console.error("Register Failed: ", error);

      let message = "Đăng ký thất bại";

      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || message;
      }

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Mobile logo */}
      <div className="mb-8 flex items-center gap-2.5 lg:hidden">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-md">
          <ShoppingBag color="white" size={19} />
        </div>
        <span className="font-display text-xl font-bold text-primary">
          GreenCart
        </span>
      </div>

      {/* Heading */}
      <div className="mb-7">
        <h2 className="font-display mb-1.5 text-[1.75rem] font-bold text-foreground">
          Đăng ký và mua sắm ngay!
        </h2>
        <p className="text-sm text-muted-foreground">
          Đăng ký để tiếp tục mua sắm và theo dõi đơn hàng của bạn.
        </p>
      </div>

      {/* Divider */}
      <div className="my-5 flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-[11px] font-medium text-muted-foreground">
          hoặc đăng ký bằng email
        </span>
        <Separator className="flex-1" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <Label htmlFor="name">Họ & Tên</Label>
          <div className="relative">
            <CaseSensitive className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="fullname"
              type="text"
              placeholder="Nhập họ tên của bạn"
              className="pl-9"
              {...register("name")}
            />
          </div>
          {errors.name && (
            <p className="text-destructive text-xs">{errors.name.message}</p>
          )}
        </div>
        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="Nhập email"
              className="pl-9"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-destructive text-xs">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="password">Mật khẩu</Label>
          <PasswordInput
            id="password"
            placeholder="••••••••"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-red-500 text-xs">{errors.password.message}</p>
          )}
        </div>

        {/* Submit */}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang đăng ký...
            </>
          ) : (
            <>
              Đăng ký
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      {/* Register link */}
      <p className="mt-5 text-center text-sm text-muted-foreground">
        Đã có tài khoản?{" "}
        <a
          href="/login"
          className="font-semibold text-primary transition-colors hover:underline"
        >
          Đăng nhập ngay
        </a>
      </p>

      {/* ToS */}
      <p className="mt-7 text-center text-[11px] leading-relaxed text-muted-foreground">
        Bằng cách đăng ký, bạn đồng ý với{" "}
        <a href="#" className="underline hover:text-primary">
          Điều khoản dịch vụ{" "}
        </a>
        và{" "}
        <a href="#" className="underline hover:text-primary">
          Chính sách bảo mật
        </a>
        .
      </p>
    </div>
  );
}
