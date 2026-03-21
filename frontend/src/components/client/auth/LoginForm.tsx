import { useState } from "react";
import { Loader2, ArrowRight, Mail, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { SocialLogin } from "./SocialLogin";
import { PasswordInput } from "./PasswordInput";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

const userSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

type UserFormData = z.infer<typeof userSchema>;

export function LoginForm() {
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

      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        data,
      );
      console.log("Login success:", res.data);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      window.location.href = "/";
    } catch (error: unknown) {
      console.error("Login Failed: ", error);
      alert(error || "Đăng nhập thất bại");
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
          Chào mừng trở lại!
        </h2>
        <p className="text-sm text-muted-foreground">
          Đăng nhập để tiếp tục mua sắm và theo dõi đơn hàng của bạn.
        </p>
      </div>

      {/* Social buttons */}
      <SocialLogin />

      {/* Divider */}
      <div className="my-5 flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-[11px] font-medium text-muted-foreground">
          hoặc đăng nhập bằng email
        </span>
        <Separator className="flex-1" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          <PasswordInput placeholder="••••••••" {...register("password")} />
          {errors.password && (
            <p className="text-red-500 text-xs">{errors.password.message}</p>
          )}
        </div>

        {/* Remember me + Forgot */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox id="remember" />
            <Label htmlFor="remember">Nhớ tài khoản</Label>
          </div>
          <a
            href="#"
            className="text-[13px] font-semibold text-primary transition-colors hover:text-primary/80 hover:underline"
          >
            Quên mật khẩu?
          </a>
        </div>

        {/* Submit */}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang đăng nhập...
            </>
          ) : (
            <>
              Đăng nhập
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      {/* Register link */}
      <p className="mt-5 text-center text-sm text-muted-foreground">
        Chưa có tài khoản?
        <a
          href="#"
          className="font-semibold text-primary transition-colors hover:underline"
        >
          Đăng ký ngay
        </a>
      </p>

      {/* ToS */}
      <p className="mt-7 text-center text-[11px] leading-relaxed text-muted-foreground">
        Bằng cách đăng nhập, bạn đồng ý với
        <a href="#" className="underline hover:text-primary">
          Điều khoản dịch vụ
        </a>
        và
        <a href="#" className="underline hover:text-primary">
          Chính sách bảo mật
        </a>
        .
      </p>
    </div>
  );
}
