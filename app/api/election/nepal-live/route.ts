import { NextResponse } from "next/server";
import { getNepalElectionLivePayload } from "@/lib/nepal-election-live";
import { getNepalElectionLiveWindow } from "@/lib/nepal-election-live-config";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const windowState = getNepalElectionLiveWindow();
    if (!windowState.enabled) {
      return NextResponse.json(
        {
          generatedAt: new Date().toISOString(),
          disabled: true,
          reason: windowState.reason || "expired",
          startAt: windowState.startAt,
          endAt: windowState.endAt,
          official: {
            election: "प्रतिनिधि सभा निर्वाचन",
            source: "Election Commission, Nepal",
            available: false,
            totalConstituencies: 0,
            totalLeadingOrWon: 0,
            parties: [],
          },
          explorer: {
            proportional: {
              available: false,
              pageUrl: "https://result.election.gov.np/PRVoteChartResult2082.aspx",
              source: "result.election.gov.np",
              itemCount: 0,
              items: [],
              rawSnippets: [],
            },
            area: {
              available: false,
              pageUrl: "https://result.election.gov.np/PRMapElectionResult2082.aspx",
              source: "result.election.gov.np",
              itemCount: 0,
              items: [],
              rawSnippets: [],
            },
          },
          sources: [],
          updates: [],
        },
        {
          headers: {
            "Cache-Control": "no-store, max-age=0",
          },
        }
      );
    }

    const payload = await getNepalElectionLivePayload();
    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        generatedAt: new Date().toISOString(),
        official: {
          election: "प्रतिनिधि सभा निर्वाचन, २०८२",
          source: "Election Commission, Nepal",
          available: false,
          totalConstituencies: 165,
          totalLeadingOrWon: 0,
          parties: [],
        },
        explorer: {
          proportional: {
            available: false,
            pageUrl: "https://result.election.gov.np/PRVoteChartResult2082.aspx",
            source: "result.election.gov.np",
            itemCount: 0,
            items: [],
            rawSnippets: [],
          },
          area: {
            available: false,
            pageUrl: "https://result.election.gov.np/PRMapElectionResult2082.aspx",
            source: "result.election.gov.np",
            itemCount: 0,
            items: [],
            rawSnippets: [],
          },
        },
        sources: [],
        updates: [],
        error: error?.message || "Failed to fetch Nepal election live feed",
      },
      { status: 500 }
    );
  }
}
