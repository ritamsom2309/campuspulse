"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  Zap,
  Users,
  Star,
  BarChart2,
  QrCode,
  ArrowRight,
  Shield,
  Brain,
  ChevronRight,
  Sparkles,
  Calendar,
  Trophy,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Recommendations",
    description:
      "Our AI matches you with events based on your past registrations, friends' networks, and interests.",
    color: "var(--color-primary)",
    bg: "rgba(139,92,246,0.08)",
    tag: "AI MATCHING",
  },
  {
    icon: QrCode,
    title: "Easy QR Check-In",
    description:
      "Volunteers scan your dynamic QR code to instantly verify and record your attendance.",
    color: "var(--color-secondary)",
    bg: "rgba(244,114,182,0.08)",
    tag: "QUICK CHECK-IN",
  },
  {
    icon: Users,
    title: "Dynamic Teams",
    description:
      "Form groups, invite classmates, and build networks for upcoming hackathons and challenges.",
    color: "var(--color-accent)",
    bg: "rgba(251,191,36,0.10)",
    tag: "TEAM BUILDING",
  },
  {
    icon: BarChart2,
    title: "Organizer Dashboard",
    description:
      "Monitor event registrations, category popularity, and visitor analytics in real-time.",
    color: "var(--color-success)",
    bg: "rgba(52,211,153,0.08)",
    tag: "INSIGHTS",
  },
  {
    icon: Trophy,
    title: "Multi-Role Access",
    description:
      "Dedicated interfaces tailored for students, campus club organizers, and event volunteers.",
    color: "var(--color-primary)",
    bg: "rgba(139,92,246,0.08)",
    tag: "USER ROLES",
  },
  {
    icon: Shield,
    title: "Instant Alerts",
    description:
      "Helpful reminders about registration deadlines, teammate requests, and schedule changes.",
    color: "var(--color-secondary)",
    bg: "rgba(244,114,182,0.08)",
    tag: "NOTIFICATIONS",
  },
];

const stats = [
  { value: "10K+", label: "Students Connected", color: "var(--color-primary)", border: "rgba(139,92,246,0.3)" },
  { value: "500+", label: "Events Hosted", color: "var(--color-secondary)", border: "rgba(244,114,182,0.3)" },
  { value: "95%", label: "Satisfaction Rate", color: "var(--color-accent)", border: "rgba(251,191,36,0.3)" },
  { value: "99%", label: "Match Accuracy", color: "var(--color-success)", border: "rgba(52,211,153,0.3)" },
];

const benefits = [
  "Discover events matched to your interests",
  "Connect with friends attending the same events",
  "Check in instantly with your personal QR code",
  "Get AI-powered recommendations every week",
];

const marqueeText =
  "HACKATHONS // DANCE CLUBS // ROBOTICS SEMINARS // PEER MATCHING // GEMINI RECOMMENDATIONS // TECH TALKS // CULTURAL FESTS // SPORTS EVENTS // HACKATHONS // DANCE CLUBS // ROBOTICS SEMINARS // PEER MATCHING // GEMINI RECOMMENDATIONS // TECH TALKS // CULTURAL FESTS // SPORTS EVENTS //";

export default function LandingPage() {
  const { isSignedIn } = useUser();

  return (
    <div
      style={{ minHeight: "100vh", background: "var(--bg-primary)", overflowX: "hidden" }}
      className="dot-grid"
    >
      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "var(--bg-card)",
          borderBottom: "3px solid var(--border)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div
          className="page-container"
          style={{
            display: "flex",
            alignItems: "center",
            height: 64,
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "var(--radius-full)",
                background: "var(--color-accent)",
                border: "2px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "2px 2px 0px 0px var(--shadow-color)",
                flexShrink: 0,
              }}
            >
              <Zap size={15} color="var(--border)" strokeWidth={2.5} />
            </div>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                fontSize: "1.2rem",
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
              }}
            >
              Campus<span style={{ color: "var(--color-primary)" }}>Pulse</span>
            </span>
          </div>

          {/* CTA buttons */}
          <div style={{ display: "flex", gap: "0.65rem", alignItems: "center" }}>
            {isSignedIn ? (
              <Link
                href="/dashboard"
                className="btn-primary"
                style={{ textDecoration: "none", fontSize: "0.78rem", padding: "0.45rem 1.25rem" }}
              >
                Go to Dashboard <ArrowRight size={12} strokeWidth={2.5} />
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="btn-ghost"
                  style={{ textDecoration: "none", fontSize: "0.78rem", padding: "0.45rem 1.15rem" }}
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="btn-primary"
                  style={{ textDecoration: "none", fontSize: "0.78rem", padding: "0.45rem 1.25rem" }}
                >
                  Get Started <ArrowRight size={12} strokeWidth={2.5} />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero Section ─────────────────────────────────────────────── */}
      <section
        style={{
          padding: "5rem 1.5rem 4.5rem",
          textAlign: "center",
          maxWidth: 860,
          margin: "0 auto",
          position: "relative",
        }}
        className="animate-fade-in"
      >
        {/* Decorative background blobs — behind text, with low z-index */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            width: 320,
            height: 320,
            borderRadius: "var(--radius-full)",
            background: "var(--color-accent)",
            opacity: 0.18,
            top: "0%",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            width: 200,
            height: 200,
            borderRadius: "var(--radius-full)",
            background: "var(--color-primary)",
            opacity: 0.10,
            top: "30%",
            left: "10%",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            width: 160,
            height: 160,
            borderRadius: "var(--radius-full)",
            background: "var(--color-secondary)",
            opacity: 0.10,
            top: "20%",
            right: "8%",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />

        {/* Badge pill */}
        <div style={{ position: "relative", zIndex: 1, display: "inline-flex", justifyContent: "center", marginBottom: "1.75rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.35rem 1rem",
              background: "var(--bg-card)",
              border: "2px solid var(--border)",
              borderRadius: "var(--radius-full)",
              boxShadow: "3px 3px 0px 0px var(--shadow-color)",
              fontFamily: "var(--font-display)",
              fontSize: "0.72rem",
              fontWeight: 800,
              color: "var(--color-primary)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            <Sparkles size={12} strokeWidth={2.5} />
            Smart Campus Events Platform
          </div>
        </div>

        {/* Main heading */}
        <h1
          style={{
            position: "relative",
            zIndex: 1,
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.4rem, 6.5vw, 4rem)",
            fontWeight: 900,
            letterSpacing: "-0.03em",
            lineHeight: 1.08,
            marginBottom: "1.5rem",
            color: "var(--text-primary)",
          }}
        >
          Your Campus,{" "}
          <span
            style={{
              display: "inline-block",
              background: "var(--color-accent)",
              padding: "0.08em 0.45em",
              border: "3px solid var(--border)",
              transform: "rotate(-1.5deg)",
              boxShadow: "4px 4px 0px 0px var(--shadow-color)",
              borderRadius: "var(--radius-sm)",
            }}
          >
            Intelligently
          </span>{" "}
          <br />
          Connected.
        </h1>

        {/* Subtitle */}
        <p
          style={{
            position: "relative",
            zIndex: 1,
            fontSize: "1rem",
            color: "var(--text-secondary)",
            fontWeight: 500,
            maxWidth: 540,
            margin: "0 auto 2.5rem",
            lineHeight: 1.75,
            fontFamily: "var(--font-sans)",
          }}
        >
          Discover events tailored to your interests, form teams with friends,
          and check in instantly with your personal QR code.
        </p>

        {/* Hero CTA buttons */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link
            href={isSignedIn ? "/dashboard" : "/sign-up"}
            className="btn-primary animate-wiggle"
            style={{
              textDecoration: "none",
              fontSize: "0.88rem",
              padding: "0.9rem 2.25rem",
              boxShadow: "5px 5px 0px 0px var(--shadow-color)",
            }}
          >
            {isSignedIn ? "Go to Dashboard" : "Start Exploring"}
            <ArrowRight size={15} strokeWidth={2.5} />
          </Link>
          <Link
            href="/events"
            className="btn-ghost"
            style={{
              textDecoration: "none",
              fontSize: "0.88rem",
              padding: "0.9rem 2.25rem",
            }}
          >
            <Calendar size={14} strokeWidth={2.5} />
            Browse Events
          </Link>
        </div>

        {/* Benefits checklist */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexWrap: "wrap",
            gap: "0.65rem 1.5rem",
            justifyContent: "center",
            marginTop: "2.5rem",
          }}
        >
          {benefits.map((b, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                fontSize: "0.78rem",
                fontWeight: 600,
                color: "var(--text-secondary)",
                fontFamily: "var(--font-sans)",
              }}
            >
              <CheckCircle2 size={14} color="var(--color-success)" strokeWidth={2.5} />
              {b}
            </div>
          ))}
        </div>
      </section>

      {/* ── Scrolling Marquee ─────────────────────────────────────────── */}
      <div
        style={{
          background: "var(--color-primary)",
          borderTop: "3px solid var(--border)",
          borderBottom: "3px solid var(--border)",
          padding: "0.8rem 0",
          overflow: "hidden",
          whiteSpace: "nowrap",
        }}
      >
        <div
          className="animate-marquee"
          style={{
            display: "inline-block",
            fontSize: "0.9rem",
            fontWeight: 900,
            fontFamily: "var(--font-display)",
            color: "#FFFFFF",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          {marqueeText}&nbsp;&nbsp;&nbsp;{marqueeText}
        </div>
      </div>

      {/* ── Stats Section ─────────────────────────────────────────────── */}
      <section style={{ padding: "5rem 1.5rem 3.5rem" }}>
        <div className="page-container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
              gap: "1.25rem",
            }}
          >
            {stats.map((stat, i) => (
              <div
                key={i}
                style={{
                  background: "var(--bg-card)",
                  border: "2px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  padding: "2rem 1.5rem",
                  textAlign: "center",
                  boxShadow: "5px 5px 0px 0px var(--shadow-color)",
                  transition: "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s",
                  cursor: "default",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translate(-2px, -2px)";
                  e.currentTarget.style.boxShadow = "7px 7px 0px 0px var(--shadow-color)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translate(0,0)";
                  e.currentTarget.style.boxShadow = "5px 5px 0px 0px var(--shadow-color)";
                }}
              >
                {/* subtle colored corner accent */}
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: 48,
                    height: 48,
                    borderRadius: "0 0 var(--radius-lg) 0",
                    background: stat.color,
                    opacity: 0.12,
                  }}
                />
                <div
                  style={{
                    fontSize: "2.5rem",
                    fontWeight: 900,
                    fontFamily: "var(--font-display)",
                    color: stat.color,
                    lineHeight: 1,
                    marginBottom: "0.5rem",
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    fontFamily: "var(--font-display)",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ────────────────────────────────────────────── */}
      <section style={{ padding: "3rem 1.5rem 6rem" }}>
        <div className="page-container">
          {/* Section heading */}
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                marginBottom: "1rem",
                background: "var(--bg-card)",
                border: "2px solid var(--border)",
                padding: "0.3rem 1rem",
                borderRadius: "var(--radius-full)",
                boxShadow: "2px 2px 0px 0px var(--shadow-color)",
                fontFamily: "var(--font-display)",
                fontSize: "0.7rem",
                fontWeight: 800,
                color: "var(--color-secondary)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              <Star size={11} strokeWidth={2.5} />
              Platform Features
            </div>
            <h2
              className="section-header"
              style={{ color: "var(--text-primary)", marginBottom: "0.75rem", fontSize: "clamp(1.5rem, 4vw, 2rem)" }}
            >
              Everything you need,{" "}
              <span style={{ color: "var(--color-primary)" }}>all in one place</span>
            </h2>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.88rem",
                fontWeight: 500,
                fontFamily: "var(--font-sans)",
                maxWidth: 480,
                margin: "0 auto",
                lineHeight: 1.7,
              }}
            >
              Easy navigation, smart calendars, and tactile tools designed to help
              you connect with your campus community.
            </p>
          </div>

          {/* Feature cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  style={{
                    background: "var(--bg-card)",
                    border: "2px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                    padding: "1.75rem",
                    boxShadow: "5px 5px 0px 0px var(--shadow-color)",
                    transition: "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s",
                    cursor: "default",
                    position: "relative",
                    overflow: "hidden",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translate(-2px, -2px) rotate(-0.4deg)";
                    e.currentTarget.style.boxShadow = `7px 7px 0px 0px var(--shadow-color)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translate(0,0) rotate(0)";
                    e.currentTarget.style.boxShadow = "5px 5px 0px 0px var(--shadow-color)";
                  }}
                >
                  {/* Subtle colored bg top-right corner */}
                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      width: 80,
                      height: 80,
                      background: feature.bg,
                      borderRadius: "0 var(--radius-md) 0 var(--radius-xl)",
                    }}
                  />

                  {/* Tag label */}
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "0.62rem",
                      fontWeight: 800,
                      color: feature.color,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      marginBottom: "1rem",
                    }}
                  >
                    // {feature.tag}
                  </div>

                  {/* Icon container */}
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      background: feature.color,
                      border: "2px solid var(--border)",
                      borderRadius: "var(--radius-sm)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "1.25rem",
                      boxShadow: "2px 2px 0px 0px var(--shadow-color)",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={20} color="#FFFFFF" strokeWidth={2.5} />
                  </div>

                  <h3
                    style={{
                      fontWeight: 800,
                      fontSize: "1rem",
                      marginBottom: "0.5rem",
                      fontFamily: "var(--font-display)",
                      color: "var(--text-primary)",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.82rem",
                      lineHeight: 1.65,
                      fontFamily: "var(--font-sans)",
                      fontWeight: 500,
                    }}
                  >
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────── */}
      <section style={{ padding: "0 1.5rem 6rem" }}>
        <div
          className="page-container"
          style={{
            background: "var(--color-primary)",
            border: "3px solid var(--border)",
            boxShadow: "8px 8px 0px 0px var(--shadow-color)",
            padding: "4rem 2.5rem",
            textAlign: "center",
            position: "relative",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
          }}
        >
          {/* Decorative shapes */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: -30,
              right: -30,
              width: 120,
              height: 120,
              borderRadius: "var(--radius-full)",
              background: "rgba(255,255,255,0.08)",
              border: "3px solid rgba(255,255,255,0.15)",
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              bottom: -20,
              left: -20,
              width: 80,
              height: 80,
              background: "rgba(255,255,255,0.06)",
              border: "3px solid rgba(255,255,255,0.12)",
              transform: "rotate(15deg)",
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: 20,
              left: 40,
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: "var(--color-accent)",
              border: "2px solid rgba(255,255,255,0.3)",
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              bottom: 24,
              right: 60,
              width: 10,
              height: 10,
              background: "var(--color-secondary)",
              border: "2px solid rgba(255,255,255,0.3)",
            }}
          />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                background: "rgba(255,255,255,0.15)",
                border: "2px solid rgba(255,255,255,0.3)",
                padding: "0.3rem 0.9rem",
                borderRadius: "var(--radius-full)",
                fontFamily: "var(--font-display)",
                fontSize: "0.7rem",
                fontWeight: 800,
                color: "#FFFFFF",
                letterSpacing: "0.06em",
                marginBottom: "1.5rem",
              }}
            >
              <Zap size={11} strokeWidth={2.5} />
              FREE TO JOIN
            </div>

            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                fontSize: "clamp(1.6rem, 4vw, 2.25rem)",
                letterSpacing: "-0.02em",
                lineHeight: 1.15,
                color: "#FFFFFF",
                marginBottom: "1rem",
                textTransform: "uppercase",
              }}
            >
              Ready to join your campus?
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.8)",
                fontSize: "0.9rem",
                fontWeight: 500,
                maxWidth: 440,
                margin: "0 auto 2.25rem",
                fontFamily: "var(--font-sans)",
                lineHeight: 1.7,
              }}
            >
              Thousands of students are already discovering and organizing
              campus events. Don't miss out.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link
                href="/sign-up"
                style={{
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: "#FFFFFF",
                  color: "var(--color-primary)",
                  border: "2px solid var(--border)",
                  borderRadius: "var(--radius-full)",
                  padding: "0.85rem 2.25rem",
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: "0.85rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  boxShadow: "4px 4px 0px 0px var(--shadow-color)",
                  transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translate(-2px,-2px)";
                  e.currentTarget.style.boxShadow = "6px 6px 0px 0px var(--shadow-color)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translate(0,0)";
                  e.currentTarget.style.boxShadow = "4px 4px 0px 0px var(--shadow-color)";
                }}
              >
                Join CampusPulse Free
                <ChevronRight size={15} strokeWidth={2.5} />
              </Link>
              <Link
                href="/events"
                style={{
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: "transparent",
                  color: "#FFFFFF",
                  border: "2px solid rgba(255,255,255,0.5)",
                  borderRadius: "var(--radius-full)",
                  padding: "0.85rem 2rem",
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  transition: "all 0.25s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.12)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.8)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)";
                }}
              >
                <Calendar size={14} strokeWidth={2.5} />
                Browse Events
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: "3px solid var(--border)",
          padding: "2rem 1.5rem",
          background: "var(--bg-card)",
        }}
      >
        <div
          className="page-container"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          {/* Brand mark */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "var(--radius-full)",
                background: "var(--color-accent)",
                border: "2px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "1.5px 1.5px 0px 0px var(--shadow-color)",
              }}
            >
              <Zap size={12} color="var(--border)" strokeWidth={2.5} />
            </div>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                fontSize: "0.9rem",
                color: "var(--text-primary)",
                letterSpacing: "-0.01em",
              }}
            >
              Campus<span style={{ color: "var(--color-primary)" }}>Pulse</span>
            </span>
          </div>

          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.72rem",
              fontWeight: 700,
              fontFamily: "var(--font-display)",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              textAlign: "center",
            }}
          >
            © 2026 CampusPulse — All Rights Reserved
          </p>

          <div style={{ display: "flex", gap: "1rem" }}>
            <Link
              href="/events"
              style={{
                color: "var(--text-muted)",
                fontSize: "0.72rem",
                fontWeight: 700,
                fontFamily: "var(--font-display)",
                textDecoration: "none",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Events
            </Link>
            <Link
              href="/sign-up"
              style={{
                color: "var(--color-primary)",
                fontSize: "0.72rem",
                fontWeight: 800,
                fontFamily: "var(--font-display)",
                textDecoration: "none",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
