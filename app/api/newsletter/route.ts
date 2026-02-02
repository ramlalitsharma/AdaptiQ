import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { trackEvent } from "@/lib/posthog-analytics";

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email || !email.includes("@")) {
            return NextResponse.json({ error: "Invalid email" }, { status: 400 });
        }

        const db = await getDatabase();
        const newsletters = db.collection("newsletters");

        // Check if already subscribed
        const existing = await newsletters.findOne({ email: email.toLowerCase() });
        if (existing) {
            return NextResponse.json({ message: "Already subscribed!" }, { status: 200 });
        }

        await newsletters.insertOne({
            email: email.toLowerCase(),
            subscribedAt: new Date(),
            active: true,
            source: "homepage_popup",
        });

        trackEvent("newsletter_subscribed", {
            email_domain: email.split("@")[1],
            source: "homepage_popup",
        });

        return NextResponse.json({ message: "Successfully subscribed!" }, { status: 201 });
    } catch (error) {
        console.error("Newsletter subscription error:", error);
        return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
    }
}
