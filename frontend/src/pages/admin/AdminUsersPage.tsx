import { useCallback, useEffect, useState } from "react";
import {
  Search,
  X,
  MoreHorizontal,
  Shield,
  ShieldOff,
  KeyRound,
  Pencil,
  Trash2,
  RefreshCw,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import {
  adminUserApi,
  type AdminUser,
  type CreateUserPayload,
  type UpdateUserPayload,
} from "@/api/adminUserApi";
import { cn } from "@/lib/utils";

// shadcn/ui components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(-2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

// ─── User Form Modal (Create / Edit) ─────────────────────────────────────────

interface UserFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: (user: AdminUser) => void;
  editUser?: AdminUser;
}

function UserFormModal({ open, onClose, onSaved, editUser }: UserFormProps) {
  const isEdit = !!editUser;
  const [saving, setSaving] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState<CreateUserPayload>({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "user",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateUserPayload, string>>
  >({});

  // Prefill khi edit
  useEffect(() => {
    if (editUser) {
      setForm({
        name: editUser.name,
        email: editUser.email,
        phone: editUser.phone ?? "",
        password: "",
        role: editUser.role,
      });
    } else {
      setForm({ name: "", email: "", phone: "", password: "", role: "user" });
    }
    setErrors({});
  }, [editUser, open]);

  const set =
    (field: keyof CreateUserPayload) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
    };

  const validate = (): boolean => {
    const errs: Partial<Record<keyof CreateUserPayload, string>> = {};
    if (!form.name.trim()) errs.name = "Vui lòng nhập họ tên";
    if (!form.email.trim()) errs.email = "Vui lòng nhập email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Email không hợp lệ";
    if (!isEdit && !form.password) errs.password = "Vui lòng nhập mật khẩu";
    else if (!isEdit && form.password.length < 6)
      errs.password = "Ít nhất 6 ký tự";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      let saved: AdminUser;
      if (isEdit) {
        const payload: UpdateUserPayload = {
          name: form.name.trim(),
          phone: form.phone?.trim(),
          role: form.role,
        };
        saved = (await adminUserApi.update(
          editUser._id,
          payload,
        )) as unknown as AdminUser;
      } else {
        saved = (await adminUserApi.create(form)) as unknown as AdminUser;
      }
      toast.success(
        isEdit ? "Đã cập nhật người dùng" : "Tạo tài khoản thành công",
      );
      onSaved(saved);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Chỉnh sửa người dùng" : "Tạo tài khoản mới"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label>
              Họ và tên <span className="text-destructive">*</span>
            </Label>
            <Input
              value={form.name}
              onChange={set("name")}
              placeholder="Nguyễn Văn A"
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-[11px] text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label>
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="example@email.com"
              disabled={isEdit}
              className={cn(
                errors.email ? "border-destructive" : "",
                isEdit && "cursor-not-allowed opacity-60",
              )}
            />
            {errors.email && (
              <p className="text-[11px] text-destructive">{errors.email}</p>
            )}
            {isEdit && (
              <p className="text-[11px] text-muted-foreground">
                Email không thể thay đổi
              </p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label>Số điện thoại</Label>
            <Input
              value={form.phone}
              onChange={set("phone")}
              placeholder="0901234567"
            />
          </div>

          {/* Password — chỉ khi tạo mới */}
          {!isEdit && (
            <div className="space-y-1.5">
              <Label>
                Mật khẩu <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  placeholder="Ít nhất 6 ký tự"
                  className={cn(
                    "pr-10",
                    errors.password ? "border-destructive" : "",
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((o) => !o)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] text-destructive">
                  {errors.password}
                </p>
              )}
            </div>
          )}

          {/* Role */}
          <div className="space-y-1.5">
            <Label>Vai trò</Label>
            <Select
              value={form.role}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, role: v as "user" | "admin" }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Người dùng</SelectItem>
                <SelectItem value="admin">Quản trị viên</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Tạo tài khoản"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Reset Password Modal ─────────────────────────────────────────────────────

function ResetPasswordModal({
  open,
  onClose,
  user,
}: {
  open: boolean;
  onClose: () => void;
  user: AdminUser | null;
}) {
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setPassword("");
      setError("");
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!user) return;
    if (password.length < 6) {
      setError("Ít nhất 6 ký tự");
      return;
    }
    setSaving(true);
    try {
      await adminUserApi.resetPassword(user._id, password);
      toast.success(`Đặt lại mật khẩu cho ${user.name} thành công`);
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Đặt lại mật khẩu</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {user && (
            <p className="text-sm text-muted-foreground">
              Đặt mật khẩu mới cho{" "}
              <span className="font-medium text-foreground">{user.name}</span>
            </p>
          )}
          <div className="space-y-1.5">
            <Label>Mật khẩu mới</Label>
            <div className="relative">
              <Input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="Ít nhất 6 ký tự"
                className={cn("pr-10", error ? "border-destructive" : "")}
              />
              <button
                type="button"
                onClick={() => setShowPass((o) => !o)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {error && <p className="text-[11px] text-destructive">{error}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "Đang lưu..." : "Đặt lại mật khẩu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────

function DeleteConfirm({
  open,
  onClose,
  onConfirm,
  user,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  user: AdminUser | null;
  loading: boolean;
}) {
  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa người dùng</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc muốn xóa tài khoản{" "}
            <span className="font-semibold text-foreground">{user?.name}</span>{" "}
            ({user?.email})? Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {loading ? "Đang xoá..." : "Xóa tài khoản"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <TableRow key={i}>
          {[200, 160, 120, 80, 90, 60].map((w, j) => (
            <TableCell key={j}>
              <div
                className="h-4 animate-pulse rounded bg-muted"
                style={{ width: w }}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 15,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"user" | "admin" | "all">("all");
  const [activeFilter, setActiveFilter] = useState<"true" | "false" | "all">(
    "all",
  );

  // Modals
  const [formOpen, setFormOpen] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | undefined>(undefined);
  const [resetPassUser, setResetPassUser] = useState<AdminUser | null>(null);
  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const res = await adminUserApi.getAll({
          page,
          search: search || undefined,
          role: roleFilter === "all" ? undefined : roleFilter,
          isActive:
            activeFilter === "all" ? undefined : activeFilter === "true",
        });

        const data = res as {
          users: AdminUser[];
          pagination: typeof pagination;
        };

        setUsers(data.users);
        setPagination(data.pagination);
      } catch {
        toast.error("Không thể tải danh sách người dùng");
      } finally {
        setLoading(false);
      }
    },
    [search, roleFilter, activeFilter],
  );

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  const handleSaved = (saved: AdminUser) => {
    setUsers((prev) => {
      const idx = prev.findIndex((u) => u._id === saved._id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
    setFormOpen(false);
    setEditUser(undefined);
  };

  const handleToggleActive = async (user: AdminUser) => {
    try {
      const updated = (await adminUserApi.toggleActive(
        user._id,
      )) as unknown as AdminUser;
      setUsers((prev) =>
        prev.map((u) => (u._id === updated._id ? updated : u)),
      );
      toast.success(
        updated.isActive ? "Đã mở khoá tài khoản" : "Đã khoá tài khoản",
      );
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
    }
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    setDeleting(true);
    try {
      await adminUserApi.delete(deleteUser._id);
      setUsers((prev) => prev.filter((u) => u._id !== deleteUser._id));
      setPagination((p) => ({ ...p, total: p.total - 1 }));
      toast.success("Đã xóa người dùng");
      setDeleteUser(null);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Không thể xóa người dùng",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h1 className="text-lg font-bold">Quản lý người dùng</h1>
          <p className="text-xs text-muted-foreground">
            {pagination.total > 0
              ? `${pagination.total} tài khoản`
              : "Chưa có tài khoản"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchUsers(pagination.page)}
          >
            <RefreshCw size={13} className="mr-1.5" />
            Làm mới
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setEditUser(undefined);
              setFormOpen(true);
            }}
          >
            <UserPlus size={13} className="mr-1.5" />
            Tạo tài khoản
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-border px-6 py-3">
        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="relative flex-1 min-w-48 max-w-xs"
        >
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tên, email, SĐT..."
            className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-8 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                setSearch("");
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={12} />
            </button>
          )}
        </form>

        {/* Role filter */}
        <Select
          value={roleFilter}
          onValueChange={(v) => setRoleFilter(v as typeof roleFilter)}
        >
          <SelectTrigger className="h-9 w-36 text-sm">
            <Filter size={12} className="mr-1.5 text-muted-foreground" />
            <SelectValue placeholder="Vai trò" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả vai trò</SelectItem>
            <SelectItem value="user">Người dùng</SelectItem>
            <SelectItem value="admin">Quản trị viên</SelectItem>
          </SelectContent>
        </Select>

        {/* Active filter */}
        <Select
          value={activeFilter}
          onValueChange={(v) => setActiveFilter(v as typeof activeFilter)}
        >
          <SelectTrigger className="h-9 w-36 text-sm">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="true">Đang hoạt động</SelectItem>
            <SelectItem value="false">Đã khoá</SelectItem>
          </SelectContent>
        </Select>

        {/* Active filter count */}
        {(search || roleFilter || activeFilter) && (
          <button
            onClick={() => {
              setSearch("");
              setSearchInput("");
              setRoleFilter("all");
              setActiveFilter("all");
            }}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <X size={12} /> Xoá bộ lọc
          </button>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-64">Người dùng</TableHead>
              <TableHead className="hidden sm:table-cell">Email</TableHead>
              <TableHead className="hidden md:table-cell">SĐT</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="hidden lg:table-cell">Ngày tạo</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableSkeleton />
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <UserPlus size={28} className="opacity-40" />
                    <p className="text-sm">
                      {search
                        ? `Không tìm thấy kết quả cho "${search}"`
                        : "Chưa có người dùng nào"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user._id} className="group">
                  {/* Avatar + name */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback
                          className={cn(
                            "text-xs font-semibold",
                            user.role === "admin"
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="max-w-40 truncate text-sm font-medium">
                        {user.name}
                      </span>
                    </div>
                  </TableCell>

                  {/* Email */}
                  <TableCell className="hidden sm:table-cell">
                    <span className="text-sm text-muted-foreground">
                      {user.email}
                    </span>
                  </TableCell>

                  {/* Phone */}
                  <TableCell className="hidden md:table-cell">
                    <span className="text-sm text-muted-foreground">
                      {user.phone || "—"}
                    </span>
                  </TableCell>

                  {/* Role */}
                  <TableCell>
                    <Badge
                      variant={user.role === "admin" ? "default" : "secondary"}
                      className="text-[11px]"
                    >
                      {user.role === "admin" ? "Admin" : "User"}
                    </Badge>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge
                      variant={user.isActive ? "outline" : "destructive"}
                      className={cn(
                        "text-[11px]",
                        user.isActive
                          ? "border-emerald-300 text-emerald-700 bg-emerald-50"
                          : "",
                      )}
                    >
                      {user.isActive ? "Hoạt động" : "Đã khoá"}
                    </Badge>
                  </TableCell>

                  {/* Created at */}
                  <TableCell className="hidden lg:table-cell">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </span>
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100"
                        >
                          <MoreHorizontal size={15} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel className="text-xs text-muted-foreground">
                          {user.name}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={() => {
                            setEditUser(user);
                            setFormOpen(true);
                          }}
                        >
                          <Pencil size={13} className="mr-2" />
                          Chỉnh sửa
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => setResetPassUser(user)}
                        >
                          <KeyRound size={13} className="mr-2" />
                          Đặt lại mật khẩu
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={() => handleToggleActive(user)}
                          className={
                            user.isActive
                              ? "text-amber-600"
                              : "text-emerald-600"
                          }
                        >
                          {user.isActive ? (
                            <>
                              <ShieldOff size={13} className="mr-2" /> Khoá tài
                              khoản
                            </>
                          ) : (
                            <>
                              <Shield size={13} className="mr-2" /> Mở khoá
                            </>
                          )}
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={() => setDeleteUser(user)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 size={13} className="mr-2" />
                          Xóa tài khoản
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border px-6 py-3">
          <span className="text-xs text-muted-foreground">
            Hiển thị {users.length} / {pagination.total} tài khoản
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => fetchUsers(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft size={14} />
            </Button>

            {Array.from(
              { length: Math.min(5, pagination.totalPages) },
              (_, i) => {
                const start = Math.max(
                  1,
                  Math.min(pagination.page - 2, pagination.totalPages - 4),
                );
                const p = start + i;
                if (p > pagination.totalPages) return null;
                return (
                  <Button
                    key={p}
                    variant={pagination.page === p ? "default" : "outline"}
                    size="icon"
                    className="h-8 w-8 text-xs"
                    onClick={() => fetchUsers(p)}
                  >
                    {p}
                  </Button>
                );
              },
            )}

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => fetchUsers(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <UserFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditUser(undefined);
        }}
        onSaved={handleSaved}
        editUser={editUser}
      />

      <ResetPasswordModal
        open={!!resetPassUser}
        onClose={() => setResetPassUser(null)}
        user={resetPassUser}
      />

      <DeleteConfirm
        open={!!deleteUser}
        onClose={() => setDeleteUser(null)}
        onConfirm={handleDelete}
        user={deleteUser}
        loading={deleting}
      />
    </div>
  );
}
