"use client";

import { useState } from "react";
import { LoginForm } from "@/components/login-form";
import { SignUpForm } from "@/components/sign-up-form";
import { Button } from "@/components/ui/button";

type AuthTab = "login" | "signup";

export function AuthHub() {
  const [activeTab, setActiveTab] = useState<AuthTab>("login");

  return (
    <div className="w-full max-w-sm space-y-4">
      {/* Tab buttons */}
      <div className="flex gap-2 border-b border-border">
        <Button
          variant={activeTab === "login" ? "default" : "ghost"}
          onClick={() => setActiveTab("login")}
          className="rounded-b-none px-3 md:px-4 py-2 text-sm md:text-base"
        >
          Login
        </Button>
        <Button
          variant={activeTab === "signup" ? "default" : "ghost"}
          onClick={() => setActiveTab("signup")}
          className="rounded-b-none px-3 md:px-4 py-2 text-sm md:text-base"
        >
          Register
        </Button>
      </div>

      {/* Tab content */}
      <div className="pt-4">
        {activeTab === "login" && <LoginForm />}
        {activeTab === "signup" && <SignUpForm />}
      </div>
    </div>
  );
}
