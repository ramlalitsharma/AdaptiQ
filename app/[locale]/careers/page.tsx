import { Metadata } from "next";
import { BRAND_URL, BRAND_NAME } from "@/lib/brand";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export const metadata: Metadata = {
    title: `Careers | ${BRAND_NAME}`,
    description: `Join the ${BRAND_NAME} team and help us revolutionize education with AI-powered adaptive learning. Explore open positions and opportunities.`,
    alternates: {
        canonical: `${BRAND_URL}/careers`,
    },
    openGraph: {
        title: `Careers at ${BRAND_NAME} - Join Our Team`,
        description: `Build the future of education with us. Explore career opportunities at ${BRAND_NAME}.`,
        url: `${BRAND_URL}/careers`,
        type: "website",
    },
};

export default function CareersPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
            <div className="container mx-auto px-4 py-16 space-y-16">
                {/* Hero Section */}
                <div className="max-w-4xl mx-auto text-center space-y-6">
                    <p className="text-sm uppercase tracking-widest text-purple-600 font-semibold">Careers at {BRAND_NAME}</p>
                    <h1 className="text-5xl md:text-6xl font-bold text-slate-900">
                        Build the Future of <span className="text-purple-600">Education</span>
                    </h1>
                    <p className="text-xl text-slate-600 leading-relaxed">
                        We're a mission-driven team using AI to democratize world-class education. Join us in creating adaptive
                        learning experiences that empower millions of learners worldwide.
                    </p>
                </div>

                {/* Why Join Us */}
                <div className="max-w-5xl mx-auto space-y-8">
                    <h2 className="text-4xl font-bold text-center text-slate-900">Why Join {BRAND_NAME}?</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <Card className="border-purple-100 hover:shadow-xl transition-shadow">
                            <CardHeader>
                                <CardTitle className="text-xl">🚀 Impact at Scale</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-600">
                                    Your work will directly impact thousands of learners every day. Build features that make education
                                    accessible, personalized, and effective for everyone.
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="border-purple-100 hover:shadow-xl transition-shadow">
                            <CardHeader>
                                <CardTitle className="text-xl">🧠 Cutting-Edge AI</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-600">
                                    Work with state-of-the-art AI models, machine learning algorithms, and adaptive systems. Push the
                                    boundaries of what's possible in EdTech.
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="border-purple-100 hover:shadow-xl transition-shadow">
                            <CardHeader>
                                <CardTitle className="text-xl">🌍 Remote-First Culture</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-600">
                                    Work from anywhere in the world. We believe in flexibility, trust, and results—not micromanagement or
                                    office politics.
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="border-purple-100 hover:shadow-xl transition-shadow">
                            <CardHeader>
                                <CardTitle className="text-xl">📈 Growth & Learning</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-600">
                                    Continuous learning budget, mentorship programs, and opportunities to attend conferences. We invest in
                                    your professional development.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Open Positions */}
                <div className="max-w-5xl mx-auto space-y-8">
                    <h2 className="text-4xl font-bold text-center text-slate-900">Open Positions</h2>
                    <Card className="border-purple-100 shadow-xl">
                        <CardContent className="p-8 text-center space-y-4">
                            <p className="text-lg text-slate-600">
                                We're currently building our team and will be posting open positions soon. In the meantime, we'd love to
                                hear from talented individuals who are passionate about education and technology.
                            </p>
                            <p className="text-slate-600">
                                <strong>Interested in joining us?</strong> Send your resume and a brief introduction to{" "}
                                <a href="mailto:careers@refectl.com" className="text-purple-600 hover:underline font-semibold">
                                    careers@refectl.com
                                </a>
                            </p>
                            <p className="text-sm text-slate-500">
                                We're especially interested in: Full-Stack Engineers, AI/ML Engineers, Product Designers, Content
                                Creators, and EdTech Specialists.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* CTA Section */}
                <div className="max-w-4xl mx-auto text-center space-y-6 bg-gradient-to-r from-purple-600 to-pink-500 rounded-3xl p-12 text-white">
                    <h2 className="text-4xl font-bold">Questions About Careers?</h2>
                    <p className="text-xl text-white/90">
                        Reach out to our team—we'd love to chat about opportunities, our culture, and what it's like to work at{" "}
                        {BRAND_NAME}.
                    </p>
                    <Link href="/contact">
                        <Button variant="inverse" className="bg-white text-purple-700 hover:bg-white/90 text-lg px-8 py-6">
                            Contact Us
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
