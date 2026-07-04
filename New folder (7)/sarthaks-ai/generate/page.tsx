import React from "react";
import { redirect } from "next/navigation";

const Page = async () => {
  // Redirect to /new for creating a new session
  return redirect("/sarthaks-ai/generate/new");
};

export default Page;
export const dynamic = "force-dynamic";
