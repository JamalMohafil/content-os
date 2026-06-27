import { NextResponse } from "next/server";
import { scanProjects } from "@/lib/projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  const projects = scanProjects();
  const counts = projects.reduce<Record<string, number>>((acc, p) => {
    acc[p.type] = (acc[p.type] || 0) + 1;
    return acc;
  }, {});
  return NextResponse.json({ projects, counts });
}
