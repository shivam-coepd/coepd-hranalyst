"use client";

import { useTransition, useState } from "react";
import { toast } from "sonner";
import { adminUpdateUserPasswordAction } from "@/app/admin/users/[id]/actions";
import { Eye, EyeOff } from "lucide-react";

export default function ChangeUserPasswordForm({ userId }: { userId: string }) {
  const [isPending, startTransition] = useTransition();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    startTransition(async () => {
      try {
        const result = await adminUpdateUserPasswordAction(userId, password);
        if (result && !result.success) {
          toast.error(result.message || "Unable to update password");
        } else {
          toast.success("User password updated successfully");
          setPassword("");
        }
      } catch (err: any) {
        toast.error(err.message || "An unexpected error occurred");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col items-start gap-4">
      <div className="w-full md:w-1/2">
        <label className="mb-1 block text-sm font-medium">New password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border px-3 py-2 pr-10"
            placeholder="Min 8 characters"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 focus:outline-none"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <button
        type="submit"
        disabled={isPending || !password}
        className="rounded bg-red-600 px-4 py-2 text-white disabled:opacity-50 hover:bg-red-700"
      >
        {isPending ? "Updating..." : "Force Update Password"}
      </button>
    </form>
  );
}
