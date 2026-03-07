import { NextRequest, NextResponse } from "next/server";
import { getNepalElectionPrExplorerPayload } from "@/lib/nepal-election-live";

export const dynamic = "force-dynamic";

function parseId(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const payload = await getNepalElectionPrExplorerPayload({
      stateId: parseId(searchParams.get("stateId")),
      districtId: parseId(searchParams.get("districtId")),
      constituencyId: parseId(searchParams.get("constituencyId")),
    });

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        generatedAt: new Date().toISOString(),
        selection: {
          stateId: null,
          districtId: null,
          constituencyId: null,
        },
        lookups: {
          states: [],
          districts: [],
          constituencies: [],
        },
        results: [],
        source: "result.election.gov.np",
        error: error?.message || "Failed to load Nepal PR explorer",
      },
      { status: 500 }
    );
  }
}
