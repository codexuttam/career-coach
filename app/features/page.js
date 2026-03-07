import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    ArrowRight,
    BrainCircuit,
    Briefcase,
    LineChart,
    ScrollText,
    CheckCircle2,
    Sparkles,
    Target,
    Trophy,
    FileText,
    MessageSquare,
    TrendingUp,
    Zap,
    Shield,
    Clock,
} from "lucide-react";

export const metadata = {
    title: "Features — Lumina AI Career Coach",
    description:
        "Discover how Lumina's AI-powered features — from smart resume building to mock interviews — help you land your dream job faster.",
};

const features = [
    {
        icon: BrainCircuit,
        tag: "AI Guidance",
        title: "AI-Powered Career Coaching",
        description:
            "Get hyper-personalised career advice based on your industry, skills, and experience level. Lumina analyses real-time market data to surface opportunities tailored just for you.",
        bullets: [
            "Personalised roadmap based on your profile",
            "Real-time industry demand signals",
            "Skill gap analysis with actionable next steps",
            "Salary benchmarking across 50+ industries",
        ],
        gradient: "from-violet-500 to-fuchsia-500",
        bgGlow: "bg-violet-500/10",
    },
    {
        icon: Briefcase,
        tag: "Interview Prep",
        title: "Mock Interview Mastery",
        description:
            "Practice with AI-generated role-specific questions, receive instant feedback on your answers, and track your improvement over time with detailed performance analytics.",
        bullets: [
            "10 tailored questions per session",
            "Instant answer explanations & scoring",
            "Performance history & improvement tips",
            "Covers technical, behavioural & situational types",
        ],
        gradient: "from-blue-500 to-cyan-500",
        bgGlow: "bg-blue-500/10",
    },
    {
        icon: ScrollText,
        tag: "Resume Builder",
        title: "Smart ATS-Optimised Resumes",
        description:
            "Build a professional, ATS-beating resume in minutes. Lumina's AI improves every bullet point with action verbs, quantified impact, and industry-specific keywords.",
        bullets: [
            "ATS score & feedback on your resume",
            "AI rewrites any section with one click",
            "Industry-standard formatting templates",
            "Download as markdown or export-ready",
        ],
        gradient: "from-emerald-500 to-teal-500",
        bgGlow: "bg-emerald-500/10",
    },
    {
        icon: FileText,
        tag: "Cover Letters",
        title: "One-Click Cover Letter Generator",
        description:
            "Paste a job description and let Lumina write a compelling, personalised cover letter in seconds — aligned with your background and the company's needs.",
        bullets: [
            "Context-aware from your profile & job description",
            "Professional business-letter markdown format",
            "Save, edit, and manage multiple letters",
            "Tailored tone: enthusiastic yet professional",
        ],
        gradient: "from-orange-500 to-rose-500",
        bgGlow: "bg-orange-500/10",
    },
    {
        icon: LineChart,
        tag: "Market Intelligence",
        title: "Live Industry Insights Dashboard",
        description:
            "Stay ahead of the curve with up-to-date salary ranges, demand trends, top skills, and market outlook for your specific industry — all powered by AI analysis.",
        bullets: [
            "Salary ranges for 5+ roles in your industry",
            "Demand level & growth rate indicators",
            "Top in-demand skills ranked by frequency",
            "Market outlook: Positive / Neutral / Negative",
        ],
        gradient: "from-yellow-500 to-amber-500",
        bgGlow: "bg-yellow-500/10",
    },
];

const highlights = [
    { icon: Zap, label: "Instant AI responses" },
    { icon: Shield, label: "Private & secure data" },
    { icon: Clock, label: "Available 24 / 7" },
    { icon: Trophy, label: "95% user success rate" },
    { icon: Target, label: "50+ industries supported" },
    { icon: Sparkles, label: "Always-updated AI models" },
];

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* ── Hero ── */}
            <section className="relative w-full pt-36 pb-20 text-center overflow-hidden">
                <div className="grid-background absolute inset-0 -z-10" />
                {/* glow blobs */}
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/20 blur-[120px] -z-10" />

                <div className="container mx-auto px-4">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-6">
                        <Sparkles className="w-4 h-4" /> Everything you need to level up
                    </span>
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold gradient-title animate-gradient mb-6">
                        Features Built for
                        <br />
                        Career Breakthroughs
                    </h1>
                    <p className="max-w-2xl mx-auto text-muted-foreground text-lg md:text-xl mb-10">
                        Lumina combines real-time AI intelligence with proven career tools so you can
                        prepare smarter, apply faster, and land the roles you deserve.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href="/dashboard">
                            <Button size="lg" className="px-8 h-12">
                                Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href="/">
                            <Button size="lg" variant="outline" className="px-8 h-12">
                                Back to Home
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── Quick highlights bar ── */}
            <section className="w-full border-y border-border bg-muted/40 py-5">
                <div className="container mx-auto px-4">
                    <div className="flex flex-wrap justify-center gap-x-10 gap-y-4">
                        {highlights.map(({ icon: Icon, label }) => (
                            <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Icon className="w-4 h-4 text-primary" />
                                <span>{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Feature deep-dives ── */}
            <section className="w-full py-20">
                <div className="container mx-auto px-4 max-w-6xl space-y-32">
                    {features.map((feature, idx) => {
                        const Icon = feature.icon;
                        const isEven = idx % 2 === 0;
                        return (
                            <div
                                key={feature.title}
                                className={`flex flex-col ${isEven ? "lg:flex-row" : "lg:flex-row-reverse"} items-center gap-12`}
                            >
                                {/* Visual card */}
                                <div className="w-full lg:w-1/2 flex-shrink-0">
                                    <div className={`relative rounded-2xl ${feature.bgGlow} border border-white/5 p-10 flex flex-col items-center justify-center gap-6 min-h-[320px] overflow-hidden`}>
                                        {/* gradient orb */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-10 blur-2xl`} />
                                        <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg`}>
                                            <Icon className="w-12 h-12 text-white" />
                                        </div>
                                        <div className="text-center z-10">
                                            <span className={`text-xs font-bold uppercase tracking-widest bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}>
                                                {feature.tag}
                                            </span>
                                            <p className="text-2xl font-bold mt-1">{feature.title}</p>
                                        </div>
                                        {/* decorative dots */}
                                        <div className="absolute bottom-4 right-4 grid grid-cols-4 gap-1">
                                            {Array.from({ length: 16 }).map((_, i) => (
                                                <div key={i} className="w-1 h-1 rounded-full bg-white/10" />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Text content */}
                                <div className="w-full lg:w-1/2 space-y-6">
                                    <div>
                                        <span className={`inline-block text-xs font-bold uppercase tracking-widest bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent mb-3`}>
                                            {feature.tag}
                                        </span>
                                        <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                                            {feature.title}
                                        </h2>
                                    </div>
                                    <p className="text-muted-foreground text-lg leading-relaxed">
                                        {feature.description}
                                    </p>
                                    <ul className="space-y-3">
                                        {feature.bullets.map((bullet) => (
                                            <li key={bullet} className="flex items-start gap-3">
                                                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                                <span className="text-foreground">{bullet}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="w-full py-24">
                <div className="container mx-auto px-4">
                    <div className="relative max-w-4xl mx-auto rounded-3xl gradient overflow-hidden p-12 text-center">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-fuchsia-600/80" />
                        <div className="relative z-10 space-y-6">
                            <h2 className="text-3xl md:text-5xl font-bold text-white">
                                Ready to Accelerate Your Career?
                            </h2>
                            <p className="text-white/80 text-lg max-w-xl mx-auto">
                                Join thousands of professionals using Lumina to land better jobs,
                                faster — with AI that actually understands your goals.
                            </p>
                            <Link href="/dashboard">
                                <Button
                                    size="lg"
                                    variant="secondary"
                                    className="h-12 px-10 mt-2 animate-bounce"
                                >
                                    Start for Free <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
