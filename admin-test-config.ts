import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import TestConfig from "@/models/testConfig.model";
import testConfigStatic from "@/static/steps/test-config.json";
import { resetTestConfigCache } from "@/utils/testConfig";

export async function GET() {
  await dbConnect();
  try {
    const config = await TestConfig.findOne({ configId: "main-config" });
    
    if (config) {
      return NextResponse.json(config);
    }
    
    return NextResponse.json(testConfigStatic);
  } catch (error: any) {
    console.error("Error fetching test config:", error);
    return NextResponse.json(testConfigStatic);
  }
}

export async function POST(req: Request) {
  await dbConnect();
  try {
    const body = await req.json();
    const { settings, grades, paperFormats, questionFormats } = body;

    const updated = await TestConfig.findOneAndUpdate(
      { configId: "main-config" },
      { settings, grades, paperFormats, questionFormats },
      { upsert: true, new: true }
    );

    // Bust the in-memory cache so generate-mcq picks up the new config immediately
    resetTestConfigCache();

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
