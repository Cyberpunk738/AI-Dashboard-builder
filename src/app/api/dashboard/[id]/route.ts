import { NextRequest, NextResponse } from "next/server";
import type { DashboardConfig } from "@/types/dashboard";

interface DashboardStore {
  [key: string]: DashboardConfig;
}

const dashboards: DashboardStore = {};

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const dashboard = dashboards[params.id];

  if (!dashboard) {
    return NextResponse.json(
      { error: "Dashboard not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ config: dashboard });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const config = body.config as DashboardConfig;

    if (!config || !config.widgets) {
      return NextResponse.json(
        { error: "Invalid dashboard config" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    dashboards[params.id] = {
      ...config,
      metadata: {
        createdAt: config.metadata?.createdAt ?? now,
        updatedAt: now,
        ...config.metadata,
      },
      schemaVersion: config.schemaVersion ?? 1,
    };

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save dashboard" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  delete dashboards[params.id];
  return NextResponse.json({ ok: true });
}
