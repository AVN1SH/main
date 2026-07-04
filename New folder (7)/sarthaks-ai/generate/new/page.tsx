import React from "react";
import ChatLayout from "@/components/chat/ChatLayout";
import { AppSidebar } from "@/components/navigations/SideBar";
import { loginBaseURL, userProfileURL } from "@/app/constants/Apis";
import { getRouteAuthData } from "@/utils/routeUtils";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/dbConnect";
import { CollectedData } from "@/types/global";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] }>;
};

const Page = async ({ searchParams }: PageProps) => {
  const auth = await getRouteAuthData();

  if (!auth.success) {
    return redirect("/login?returnUrl=/sarthaks-ai/generate/new");
  }

  const { bearerToken, userId } = auth.data;
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

  if (userId) {
    await dbConnect();
  }
  const userData = await response.json();

  const params = await searchParams;
  const course = typeof params.class === "string" ? params.class : undefined;
  const subject = typeof params.subject === "string" ? params.subject : undefined;
  const chapter = typeof params.chapter === "string" ? params.chapter : undefined;
  const board = typeof params.board === "string" ? params.board : undefined;
  const paperType = typeof params.paperType === "string" ? params.paperType : undefined;
  const language = typeof params.language === "string" ? params.language : undefined;

  const initialCollectedData: CollectedData[] = [];
  if (course) {
    initialCollectedData.push({
      id: `preload-course-${Date.now()}`,
      key: "class",
      value: course,
    });
  }
  if (board) {
    initialCollectedData.push({
      id: `preload-board-${Date.now()}`,
      key: "board",
      value: board,
    });
  }
  if (subject) {
    initialCollectedData.push({
      id: `preload-subject-${Date.now()}`,
      key: "subject",
      value: subject,
    });
  }
  if (paperType) {
    initialCollectedData.push({
      id: `preload-paperType-${Date.now()}`,
      key: "paperType",
      value: paperType,
    });
  }
  if (chapter) {
    initialCollectedData.push({
      id: `preload-chapter-${Date.now()}`,
      key: "chapter",
      value: chapter,
    });
  }
  if (language) {
    initialCollectedData.push({
      id: `preload-language-${Date.now()}`,
      key: "language",
      value: language,
    });
  }

  return (
    // <div className="flex h-screen w-full">
    //   <AppSidebar userData={userData?.user_details || null} />
    <div className="flex-1 h-full">
      <ChatLayout
        isNew={true}
        initialCollectedData={initialCollectedData}
      />
    </div>
    // </div>
  );
};

export default Page;
export const dynamic = "force-dynamic";
