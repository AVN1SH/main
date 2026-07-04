import { loginBaseURL, userProfileURL } from "@/app/constants/Apis";
import { AppSidebar } from "@/components/navigations/SideBar";
import { getRouteAuthData } from "@/utils/routeUtils";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

const layout = async ({ children }: { children: React.ReactNode }) => {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname");

  let userData = null;

  if (pathname !== "/sarthaks-ai") {
    const auth = await getRouteAuthData();

    if (!auth.success) {
      return redirect("/login?returnUrl=/sarthaks-ai/generate/new");
    }

    const { bearerToken } = auth.data;
    const apiUrl = `${loginBaseURL}${userProfileURL}`;

    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return redirect("/login?returnUrl=/sarthaks-ai/generate/new");
    }

    userData = await response.json();
  }

  return (
    <div className="flex w-full min-h-screen bg-gray-100">
      {pathname !== "/sarthaks-ai" && (
        <AppSidebar userData={userData?.user_details || null} />
      )}
      {children}
    </div>
  );
};

export default layout;
