import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import TestConfig from "@/models/testConfig.model";
import { resetTestConfigCache, SubjectSectionConfig } from "@/utils/testConfig";

export async function GET() {
  await dbConnect();
  try {
    const config = await TestConfig.findOne({ configId: "main-config" });
    
    if (config) {
      return NextResponse.json(config);
    }

    const defaultConfig = {
      configId: "main-config",
      settings: { defaultYear: new Date().getFullYear(), fallbackYear: new Date().getFullYear() - 1 },
      grades: {},
      paperFormats: {},
      questionFormats: {},
    };
    
    return NextResponse.json(defaultConfig);
  } catch (error: any) {
    console.error("Error fetching test config:", error);
    return NextResponse.json(
      { error: "Failed to load test configuration" },
      { status: 500 },
    );
  }
}

function migrateScoringOnSectionRename(
  incomingGrades: Record<string, any>,
  existingGrades: Record<string, any> | undefined,
): Record<string, any> {
  if (!existingGrades) return incomingGrades;

  const result: Record<string, any> = { ...incomingGrades };

  for (const [gradeName, incomingGrade] of Object.entries(result)) {
    const existingGrade = existingGrades[gradeName];
    if (!existingGrade) continue;

    const incomingSections = (incomingGrade as any).subjectSections as Record<string, SubjectSectionConfig[]> | undefined;
    const existingSections = (existingGrade as any).subjectSections as Record<string, SubjectSectionConfig[]> | undefined;

    if (!incomingSections || !existingSections) continue;

    const renameMap: Record<string, string> = {};
    for (const [subjectKey, oldSections] of Object.entries(existingSections)) {
      const newSections = incomingSections[subjectKey];
      if (!newSections) continue;

      for (let i = 0; i < oldSections.length; i++) {
        const oldName = oldSections[i]?.sectionName;
        const newName = newSections[i]?.sectionName;
        if (oldName && newName && oldName !== newName) {
          renameMap[oldName] = newName;
        }
      }
    }

    if (Object.keys(renameMap).length === 0) continue;

    const scoring = (incomingGrade as any).scoring as Record<string, any> | undefined;
    if (!scoring) continue;

    const newScoring: Record<string, any> = {};
    for (const [key, value] of Object.entries(scoring)) {
      let newKey = key;
      for (const [oldName, newName] of Object.entries(renameMap)) {
        const normOldName = oldName.toLowerCase().replace(/\s+/g, "_");
        const normNewName = newName.toLowerCase().replace(/\s+/g, "_");
        const prefix = normOldName + "::";
        if (key.startsWith(prefix)) {
          newKey = normNewName + key.slice(normOldName.length);
          break;
        }
      }
      newScoring[newKey] = value;
    }

    result[gradeName] = { ...incomingGrade, scoring: newScoring };
  }

  return result;
}

export async function POST(req: Request) {
  await dbConnect();
  try {
    const body = await req.json();
    const { settings, grades, paperFormats, questionFormats } = body;

    const existing = await TestConfig.findOne({ configId: "main-config" }).lean();
    const existingGrades = existing?.grades as Record<string, any> | undefined;

    const migratedGrades = migrateScoringOnSectionRename(grades, existingGrades);

    const updated = await TestConfig.findOneAndUpdate(
      { configId: "main-config" },
      { settings, grades: migratedGrades, paperFormats, questionFormats },
      { upsert: true, new: true }
    );

    // Bust the in-memory cache so generate-mcq picks up the new config immediately
    resetTestConfigCache();

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
