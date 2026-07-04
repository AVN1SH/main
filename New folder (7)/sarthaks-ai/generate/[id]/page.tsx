import React from "react";
import ChatLayout from "@/components/chat/ChatLayout";
import { AppSidebar } from "@/components/navigations/SideBar";
import { loginBaseURL, userProfileURL } from "@/app/constants/Apis";
import { getRouteAuthData } from "@/utils/routeUtils";
import { redirect } from "next/navigation";
import mongoose, { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import UserHistoryModel from "@/models/userHistory.model";
import { FormDetails, QuestionPaper } from "@/types/global";
import TestPaperModel from "@/models/testPaper.model";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

const Page = async ({ params }: PageProps) => {
  const { id } = await params;

  let data = null;
  let userData = null;

  try {
    const auth = await getRouteAuthData();
    if (!auth.success || !auth.data?.userId) {
      return redirect(`/login?returnUrl=/sarthaks-ai/generate/${id}`);
    }
    const userId = String(auth.data.userId);
    const { bearerToken } = auth.data;
    const apiUrl = `${loginBaseURL}${userProfileURL}`;

    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return redirect(`/login?returnUrl=/sarthaks-ai/generate/${id}`);
    }

    userData = await response.json();

    const mongoId = new mongoose.Types.ObjectId(id);

    await dbConnect();

    const item = await UserHistoryModel.findOne({
      _id: mongoId,
      userId,
    }).lean();

    const paper = JSON.parse(item.paperJson) as QuestionPaper;

    let language: string | undefined = undefined;

    if (item.testPaper) {
      const testPaperDoc = await TestPaperModel.findById(item.testPaper).lean();
      if (testPaperDoc) {
        language = testPaperDoc.language || undefined;
      }
    } else if (item.language) {
      language = item.language;
    }

    const subjectLabel = item.subject.replace(/_/g, " ");

    const config: FormDetails = {
      class: item.class,
      subject: subjectLabel,
      paperType: item.paperType,
      examType: item.exam_type,
      language,
    };

    const messages = item.messages;

    data = {
      paper: {
        ...paper,
        samplePaperId: item.samplePaperId || null,
        isSubmitted: paper.isSubmitted,
      },
      config,
      messages,
      title: item.title,
    };
  } catch (error) {
    console.log(error);
    return redirect(`/sarthaks-ai/generate/${id}`);
  }

  const initialPaper = data?.paper;
  const initialConfig = data?.config;
  const initialMessages = data?.messages;
  const initialTitle = data?.title;

  return (
    // <div className="flex h-screen w-full">
    //   <AppSidebar userData={userData?.user_details || null} />
    <div className="flex-1 h-full">
      <ChatLayout
        historyId={id}
        initialPaper={null}
        initialConfig={null}
        initialMessages={null}
        initialTitle={initialTitle || null}
      />
    </div>
    // </div>
  );
};

export default Page;
export const dynamic = "force-dynamic";
