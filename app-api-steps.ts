import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import GradeStep from "@/models/gradeStep.model";
import configStatic from "@/static/steps/config.json";

interface Step {
  id: string;
  text: string;
  options: string[];
  key_name: string;
}

interface StepConfig {
  initialSteps: Step[];
  grades: Record<string, string>;
}

const staticConfig = configStatic as unknown as StepConfig;

export async function GET() {
  await dbConnect();
  try {
    const gradeSteps = await GradeStep.find({}).sort({ gradeId: 1 }).lean() as any[];
    
    if (!gradeSteps || gradeSteps.length === 0) {
      return NextResponse.json(staticConfig);
    }

    // Only include courses that are active (undefined treated as true for backwards compat)
    const activeGradeSteps = gradeSteps.filter((g) => g.active !== false);

    if (activeGradeSteps.length === 0) {
      // All disabled — return empty course list but keep structure
      return NextResponse.json({
        initialSteps: staticConfig.initialSteps.map((step) =>
          step.key_name === "class" ? { ...step, options: [] } : step,
        ),
        grades: {},
        _metadata: { source: "database", gradeCount: 0 },
      });
    }

    const gradeOptions = activeGradeSteps.map((g) => g.gradeId);
    
    const updatedInitialSteps = staticConfig.initialSteps.map((step) => {
      if (step.key_name === "class") {
        return {
          ...step,
          options: gradeOptions,
        };
      }
      return step;
    });

    const gradesMap: Record<string, string> = {};
    activeGradeSteps.forEach((g) => {
      gradesMap[g.gradeId] = g.gradeId;
    });

    return NextResponse.json({
      initialSteps: updatedInitialSteps,
      grades: gradesMap,
      _metadata: {
        source: "database",
        gradeCount: activeGradeSteps.length,
      },
    });
  } catch (error: any) {
    console.error("Error fetching steps from DB:", error);
    return NextResponse.json(staticConfig);
  }
}
