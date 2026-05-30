"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useCurrentUser } from "../../../../hooks/useCurrentUser";
import { useEventOrganizer } from "../../../../hooks/useEventOrganizer";
import Navbar from "../../../../components/layout/Navbar";
import dynamic from "next/dynamic";
import { useState, useCallback } from "react";
import {
  Calendar, Users, Eye, Heart, BarChart2, QrCode, CheckCircle,
  XCircle, ArrowLeft, Search, UserCheck, Clock, Settings,
  UserPlus, ShieldAlert, Loader2, Trash2
} from "lucide-react";
import { formatDate } from "../../../../lib/utils/formatDate";

// Dynamic import to prevent camera APIs SSR issues
const QRScanner = dynamic(
  () => import("../../../../components/qr/QRScanner").then((m) => m.QRScanner),
  {
    ssr: false,
    loading: () => (
      <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
        <Loader2 size={24} style={{ animation: "spin 1s linear infinite", margin: "0 auto 0.75rem", display: "block" }} />
        Loading camera scanner...
      </div>
    )
  }
);

function MetricCard({ label, value, color, icon: Icon }) {
  return (
    <div 
      className="glass-card" 
      style={{ 
        padding: "1.25rem", 
        borderLeft: `4px solid ${color}`,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}
    >
      <div>
        <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-display)", lineHeight: 1.1 }}>
          {value}
        </div>
        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.4rem", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
          {label}
        </div>
      </div>
      {Icon && (
        <div style={{ 
          background: `${color}15`, 
          border: `1px solid ${color}30`, 
          borderRadius: "var(--radius-sm)", 
          width: 42, 
          height: 42, 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          flexShrink: 0 
        }}>
          <Icon size={20} color={color} />
        </div>
      )}
    </div>
  );
}

function formatRelativeTime(timestamp) {
  const diffMs = Date.now() - timestamp;
  const diffSecs = Math.floor(diffMs / 1000);
  if (diffSecs < 5) return "Just now";
  if (diffSecs < 60) return `${diffSecs}s ago`;
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  return `${diffHours}h ago`;
}

export default function EventManagerPage() {
  const { eventId } = useParams();
  const router = useRouter();
  const { user, isLoaded: userLoaded } = useCurrentUser();
  const { canCheckIn, role: organizerRole, isLoading: authLoading } = useEventOrganizer(eventId, user?._id);

  // States
  const [activeTab, setActiveTab] = useState("overview"); // overview, scanner, roster, staff
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [manualToken, setManualToken] = useState("");
  const [manualLoading, setManualLoading] = useState(false);
  const [rosterSearch, setRosterSearch] = useState("");
  const [rosterFilter, setRosterFilter] = useState("all"); // all, present, absent
  const [crewSearch, setCrewSearch] = useState("");
  const [inviteRole, setInviteRole] = useState("volunteer"); // volunteer, organizer
  const [processing, setProcessing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Queries
  const event = useQuery(api.events.getEventById, { eventId });
  const registrations = useQuery(api.registrations.getEventRegistrations, { eventId });
  const attendance = useQuery(api.attendance.getEventAttendance, { eventId });
  const staff = useQuery(api.organizers.getEventOrganizers, { eventId });
  const crewSearchResults = useQuery(
    api.users.searchUsers,
    crewSearch.trim().length >= 2 ? { query: crewSearch } : "skip"
  );

  // Mutations
  const checkInByQR = useMutation(api.attendance.checkInByQR);
  const manualCheckIn = useMutation(api.attendance.manualCheckIn);
  const addOrganizer = useMutation(api.organizers.addOrganizer);
  const removeOrganizer = useMutation(api.organizers.removeOrganizer);

  // QR Scanning Handler
  const handleScan = useCallback(async (qrToken) => {
    if (processing || scanResult) return;
    setProcessing(true);
    try {
      const result = await checkInByQR({ qrToken });
      
      // Safety check: Verify if QR token is for *this* event
      if (result.success && result.event && result.event._id !== eventId) {
        setScanResult({
          success: false,
          message: `Check-in rejected: Attendee is registered for a different event ("${result.event.title}").`
        });
      } else {
        setScanResult(result);
      }
      setScanning(false);
    } catch (err) {
      setScanResult({ success: false, message: err.message ?? "Scan check-in failed" });
      setScanning(false);
    } finally {
      setProcessing(false);
    }
  }, [processing, scanResult, checkInByQR, eventId]);

  // Manual Check-in Handler
  const handleManualCheckIn = async () => {
    if (!manualToken.trim()) return;
    setManualLoading(true);
    try {
      const result = await checkInByQR({ qrToken: manualToken.trim() });
      
      if (result.success && result.event && result.event._id !== eventId) {
        setScanResult({
          success: false,
          message: `Warning: Scanned token is registered for a different event ("${result.event.title}").`
        });
      } else {
        setScanResult(result);
      }
      setManualToken("");
    } catch (err) {
      setScanResult({ success: false, message: err.message ?? "Invalid token" });
    } finally {
      setManualLoading(false);
    }
  };

  // Direct Roster Check-in click
  const handleRosterCheckIn = async (attendeeUserId) => {
    if (!user || !eventId) return;
    setActionLoadingId(attendeeUserId);
    try {
      const result = await manualCheckIn({
        eventId,
        userId: attendeeUserId,
        operatorUserId: user._id
      });
      if (result.success) {
        setScanResult({ success: true, message: "Attendee checked in successfully from roster." });
      } else {
        setScanResult({ success: false, message: result.message ?? "Check-in failed" });
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Crew Recruiting Handler
  const handleInviteCrew = async (targetUserId) => {
    if (!user || !eventId) return;
    setProcessing(true);
    try {
      await addOrganizer({
        eventId,
        userId: targetUserId,
        role: inviteRole,
        requestingUserId: user._id
      });
      setCrewSearch("");
      setScanResult({ success: true, message: "Staff crew member added successfully!" });
    } catch (err) {
      alert(err.message ?? "Failed to add crew member");
    } finally {
      setProcessing(false);
    }
  };

  // Crew Removal Handler
  const handleRemoveCrew = async (targetUserId, targetName) => {
    if (!user || !eventId) return;
    if (!confirm(`Are you sure you want to remove ${targetName} from the event crew?`)) return;
    try {
      await removeOrganizer({
        eventId,
        userId: targetUserId,
        requestingUserId: user._id
      });
      setScanResult({ success: true, message: "Crew member removed successfully." });
    } catch (err) {
      alert(err.message ?? "Failed to remove crew member");
    }
  };

  // Loading Screen
  if (authLoading || !userLoaded || event === undefined) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }} className="dot-grid">
        <Navbar />
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "3rem 1.5rem", textAlign: "center" }}>
          <Loader2 size={36} color="var(--color-primary)" style={{ animation: "spin 1s linear infinite", margin: "4rem auto" }} />
        </div>
      </div>
    );
  }

  // Access Denied Speech Bubble Block
  if (!canCheckIn) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }} className="dot-grid">
        <Navbar />
        <div style={{ maxWidth: 600, margin: "4rem auto", padding: "1.5rem" }}>
          <div className="speech-bubble pop-shadow" style={{ padding: "3rem 2rem", textAlign: "center", background: "var(--bg-card)" }}>
            <div style={{ width: 50, height: 50, borderRadius: "50%", background: "var(--color-secondary)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", boxShadow: "2px 2px 0px 0px var(--shadow-color)" }}>
              <ShieldAlert size={20} color="#FFFFFF" strokeWidth={2.5} />
            </div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.25rem", color: "var(--text-primary)", marginBottom: "0.5rem" }}>
              ACCESS DENIED
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontFamily: "var(--font-sans)", fontWeight: 500, lineHeight: 1.5, marginBottom: "1.5rem" }}>
              You do not have staff operational privileges to manage this event. Only owners, authorized organizers, and volunteers are permitted access.
            </p>
            <button onClick={() => router.push(`/events/${eventId}`)} className="btn-primary" style={{ fontSize: "0.85rem" }}>
              Back to Event Detail
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Attendance rate math
  const registeredCount = registrations?.length ?? event.registrationCount ?? 0;
  const attendedCount = attendance?.length ?? 0;
  const attendanceRate = registeredCount > 0 ? Math.round((attendedCount / registeredCount) * 100) : 0;

  // Recent 5 check-ins
  const recentCheckIns = [...(attendance ?? [])]
    .sort((a, b) => b.checkedInAt - a.checkedInAt)
    .slice(0, 5);

  // Present vs Absent counts
  const presentCount = (registrations ?? []).filter((reg) => (attendance ?? []).some((a) => a.userId === reg.userId)).length;
  const absentCount = Math.max(0, registeredCount - presentCount);

  // Filtered Roster search & status filter
  const filteredRoster = (registrations ?? []).filter((reg) => {
    // 1. Status Filter
    const isCheckedIn = (attendance ?? []).some((a) => a.userId === reg.userId);
    if (rosterFilter === "present" && !isCheckedIn) return false;
    if (rosterFilter === "absent" && isCheckedIn) return false;

    // 2. Search Query Filter
    if (!rosterSearch) return true;
    const searchLower = rosterSearch.toLowerCase();
    return (
      reg.user?.name?.toLowerCase().includes(searchLower) ||
      reg.user?.email?.toLowerCase().includes(searchLower) ||
      reg.user?.department?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }} className="dot-grid">
      <Navbar />

      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem 1.5rem" }}>
        {/* Back and Title Header */}
        <div style={{ marginBottom: "2rem" }}>
          <button
            onClick={() => router.push(`/events/${eventId}`)}
            className="btn-ghost"
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "0.4rem", 
              fontSize: "0.78rem", 
              padding: "0.4rem 0.85rem",
              marginBottom: "1rem" 
            }}
          >
            <ArrowLeft size={14} /> Back to Event Details
          </button>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--color-primary)", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "0.75rem", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
                <Settings size={12} strokeWidth={2.5} />
                EVENT MANAGEMENT DASHBOARD // ROLE: {organizerRole?.toUpperCase()}
              </div>
              <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "1.75rem", color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
                {event.title.toUpperCase()}
              </h1>
            </div>
          </div>
        </div>

        {/* Tab Selection Row (Brutalist panel styling) */}
        <div style={{ 
          display: "flex", 
          gap: "0.5rem", 
          background: "var(--bg-elevated)", 
          padding: "0.5rem", 
          borderRadius: "var(--radius-md)", 
          border: "2px solid var(--border)", 
          marginBottom: "2rem", 
          width: "fit-content", 
          overflowX: "auto",
          boxShadow: "3px 3px 0px 0px var(--shadow-color)"
        }}>
          {[
            { key: "overview", label: "Overview & Stats", icon: BarChart2 },
            { key: "scanner", label: "QR Check-in Scanner", icon: QrCode },
            { key: "roster", label: `Attendee Roster (${registeredCount})`, icon: Users },
            { key: "staff", label: `Staff Crew (${staff?.length ?? 0})`, icon: UserCheck }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setScanResult(null); }}
                style={{
                  padding: "0.5rem 1.15rem",
                  borderRadius: "var(--radius-sm)",
                  border: "2px solid " + (active ? "var(--border)" : "transparent"),
                  cursor: "pointer",
                  background: active ? "var(--color-primary)" : "transparent",
                  color: active ? "white" : "var(--text-primary)",
                  fontSize: "0.82rem",
                  fontWeight: 800,
                  transition: "all 0.15s ease",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  whiteSpace: "nowrap",
                  boxShadow: active ? "2px 2px 0px 0px var(--shadow-color)" : "none"
                }}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Live Notification banners from scans */}
        {scanResult && (
          <div className="glass-card animate-fade-in" style={{
            padding: "1rem 1.25rem",
            marginBottom: "2rem",
            border: `2px solid var(--border)`,
            background: scanResult.success ? "var(--bg-card)" : "var(--bg-card)",
            boxShadow: `4px 4px 0px 0px ${scanResult.success ? "var(--color-success)" : "var(--color-danger)"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            borderRadius: "var(--radius-md)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              {scanResult.success ? (
                <CheckCircle size={20} color="var(--color-success)" style={{ flexShrink: 0 }} />
              ) : (
                <XCircle size={20} color="var(--color-danger)" style={{ flexShrink: 0 }} />
              )}
              <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--text-primary)" }}>
                {scanResult.message}
              </span>
            </div>
            <button
              onClick={() => setScanResult(null)}
              className="btn-ghost"
              style={{ fontSize: "0.72rem", padding: "0.3rem 0.75rem" }}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tab Contents */}
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Metric grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1.25rem" }}>
              <MetricCard label="Total Registrants" value={registeredCount} color="#6366f1" icon={Users} />
              <MetricCard label="Checked In Users" value={attendedCount} color="#10b981" icon={UserCheck} />
              <MetricCard label="Attendance Rate" value={`${attendanceRate}%`} color="#06b6d4" icon={BarChart2} />
              <MetricCard label="Total Views" value={event.viewCount ?? 0} color="#f59e0b" icon={Eye} />
              <MetricCard label="Total Likes" value={event.likeCount ?? 0} color="#ef4444" icon={Heart} />
            </div>

            {/* Attendance Progress bar and Live Feed */}
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "1.5rem" }} className="teams-split-layout">
              {/* Capacity Progress bar */}
              <div className="glass-card" style={{ padding: "1.5rem" }}>
                <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "1.25rem", color: "var(--text-primary)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Users size={16} color="var(--color-primary)" /> Live Attendance & Capacity
                </h3>
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.4rem", marginBottom: "0.75rem" }}>
                  <span style={{ fontSize: "2rem", fontWeight: 800 }}>{attendedCount}</span>
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem", fontWeight: 500 }}>
                    checked in / {event.maxParticipants ? `${event.maxParticipants} capacity` : "unlimited spots"}
                  </span>
                </div>
                <div className="score-bar" style={{ height: 16, marginBottom: "0.75rem" }}>
                  <div 
                    className="score-bar-fill" 
                    style={{ 
                      width: `${attendanceRate}%`, 
                      background: "linear-gradient(90deg, var(--color-primary), var(--color-secondary))" 
                    }} 
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                  <span>Rate: {attendanceRate}%</span>
                  <span>Registrants: {registeredCount}</span>
                </div>
              </div>

              {/* Recent Check-ins widget */}
              <div className="glass-card" style={{ padding: "1.5rem" }}>
                <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "1.25rem", color: "var(--text-primary)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Clock size={16} color="var(--color-secondary)" /> Live Check-ins Feed
                </h3>
                {recentCheckIns.length === 0 ? (
                  <div style={{ padding: "1.5rem 0", fontStyle: "italic", color: "var(--text-muted)", fontSize: "0.8rem", textAlign: "center" }}>
                    No attendee has checked in yet.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {recentCheckIns.map((a) => {
                      if (!a.user) return null;
                      const isManual = a.qrToken?.startsWith("manual-");
                      return (
                        <div key={a._id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <img
                              src={a.user.imageUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(a.user.name)}&background=6366f1&color=fff`}
                              alt={a.user.name}
                              style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", border: "1px solid var(--border)" }}
                            />
                            <div>
                              <div style={{ fontWeight: 700, fontSize: "0.8rem", color: "var(--text-primary)" }}>{a.user.name}</div>
                              <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                                {isManual ? "Manual Override" : "QR Verified Scan"}
                              </div>
                            </div>
                          </div>
                          <span style={{ fontSize: "0.68rem", color: "var(--color-primary)", fontWeight: 700 }}>
                            {formatRelativeTime(a.checkedInAt)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* QR SCANNER TAB */}
        {activeTab === "scanner" && (
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "1.5rem", alignItems: "start" }} className="teams-split-layout">
            {/* Live Camera Scanner */}
            <div className="glass-card" style={{ padding: "1.5rem" }}>
              <h3 style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: "1rem", color: "var(--text-primary)" }}>
                Live Camera QR Scanner
              </h3>
              {!scanning ? (
                <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                  <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
                    <QrCode size={32} color="#06b6d4" />
                  </div>
                  <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", fontSize: "0.85rem" }}>
                    Activate your webcam to scan attendee check-in passes.
                  </p>
                  <button
                    onClick={() => { setScanning(true); setScanResult(null); }}
                    className="btn-primary"
                    style={{ fontSize: "0.85rem" }}
                  >
                    Activate Camera
                  </button>
                </div>
              ) : (
                <div>
                  <QRScanner onScan={handleScan} />
                  <button
                    onClick={() => setScanning(false)}
                    className="btn-ghost"
                    style={{ width: "100%", marginTop: "0.75rem", fontSize: "0.82rem" }}
                  >
                    Turn Camera Off
                  </button>
                </div>
              )}

              {processing && (
                <div style={{ textAlign: "center", padding: "1.5rem" }}>
                  <Loader2 size={24} color="#06b6d4" style={{ animation: "spin 1s linear infinite" }} />
                  <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem", fontSize: "0.78rem" }}>Recording check-in credentials...</p>
                </div>
              )}
            </div>

            {/* Manual checkin override code */}
            <div className="glass-card" style={{ padding: "1.5rem" }}>
              <h3 style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: "0.75rem", color: "var(--text-primary)" }}>
                Manual Check-in Override
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.78rem", lineHeight: 1.4, marginBottom: "1.25rem" }}>
                If an attendee's device is offline or the camera cannot read the QR pass, input the code token manually below.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <input
                  type="text"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleManualCheckIn()}
                  placeholder="Paste or type check-in token..."
                  className="input-field"
                  style={{ fontFamily: "monospace", fontSize: "0.78rem" }}
                />
                <button
                  onClick={handleManualCheckIn}
                  disabled={manualLoading || !manualToken.trim()}
                  className="btn-primary"
                  style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.35rem", fontSize: "0.85rem", width: "100%" }}
                >
                  {manualLoading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <UserCheck size={14} />}
                  Check In Pass
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ATTENDEE ROSTER TAB */}
        {activeTab === "roster" && (
          <div className="glass-card" style={{ padding: "1.5rem" }}>
            {/* Filter Pills */}
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
              {[
                { key: "all", label: "All Registered", count: registeredCount, color: "var(--color-primary)" },
                { key: "present", label: "Checked In (Present)", count: presentCount, color: "var(--color-success)" },
                { key: "absent", label: "Absent (Pending)", count: absentCount, color: "var(--color-danger)" }
              ].map((pill) => {
                const active = rosterFilter === pill.key;
                const textColor = active ? (pill.key === "present" ? "var(--text-primary)" : "white") : "var(--text-secondary)";
                return (
                  <button
                    key={pill.key}
                    onClick={() => setRosterFilter(pill.key)}
                    style={{
                      padding: "0.35rem 0.85rem",
                      borderRadius: "var(--radius-full)",
                      border: "2px solid var(--border)",
                      cursor: "pointer",
                      background: active ? pill.color : "transparent",
                      color: textColor,
                      fontSize: "0.72rem",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      boxShadow: active ? "2px 2px 0px 0px var(--shadow-color)" : "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      transition: "all 0.15s ease"
                    }}
                  >
                    {pill.label}
                    <span style={{ 
                      fontSize: "0.65rem", 
                      background: active ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.08)", 
                      borderRadius: "var(--radius-full)", 
                      padding: "0.05rem 0.35rem" 
                    }}>
                      {pill.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Input bar */}
            <div style={{ position: "relative", marginBottom: "1.5rem" }}>
              <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                value={rosterSearch}
                onChange={(e) => setRosterSearch(e.target.value)}
                placeholder="Search registered attendees by name, department, email..."
                className="input-field"
                style={{ paddingLeft: "2.5rem" }}
              />
            </div>

            {/* Attendee grid */}
            {!registrations ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
                <Loader2 size={24} color="var(--color-primary)" style={{ animation: "spin 1s linear infinite" }} />
              </div>
            ) : filteredRoster.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>
                No classmate registrations matched your query.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {filteredRoster.map((reg) => {
                  if (!reg.user) return null;
                  const isCheckedIn = (attendance ?? []).some((a) => a.userId === reg.userId);
                  const isPendingAction = actionLoadingId === reg.userId;

                  return (
                    <div
                      key={reg._id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        padding: "0.6rem 0.875rem",
                        background: isCheckedIn ? "rgba(16,185,129,0.06)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${isCheckedIn ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.06)"}`,
                        borderRadius: "var(--radius-md)",
                        flexWrap: "wrap",
                        justifyContent: "space-between"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <img
                          src={reg.user.imageUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(reg.user.name)}&background=6366f1&color=fff`}
                          alt={reg.user.name}
                          style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover" }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--text-primary)" }}>{reg.user.name}</div>
                          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                            {reg.user.department || "No Dept"} · {reg.user.year || "Unknown"}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        {isCheckedIn ? (
                          <span className="badge badge-success" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.2rem 0.5rem", background: "rgba(16,185,129,0.15)" }}>
                            <CheckCircle size={10} /> Present
                          </span>
                        ) : (
                          <button
                            onClick={() => handleRosterCheckIn(reg.userId)}
                            disabled={isPendingAction}
                            style={{ 
                              fontSize: "0.72rem", 
                              padding: "0.35rem 0.75rem", 
                              background: "var(--color-success)", 
                              color: "var(--text-primary)",
                              border: "2px solid var(--border)",
                              borderRadius: "var(--radius-full)",
                              boxShadow: "2px 2px 0px 0px var(--shadow-color)",
                              fontWeight: 800,
                              textTransform: "uppercase",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.3rem",
                              transition: "all 0.15s ease"
                            }}
                          >
                            {isPendingAction ? (
                              <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} />
                            ) : (
                              <>
                                <CheckCircle size={12} /> Check In
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* STAFF TAB */}
        {activeTab === "staff" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Recruit Crew Member Section (Only visible to Owners) */}
            {organizerRole === "owner" && (
              <div className="glass-card" style={{ padding: "1.5rem" }}>
                <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.5rem", color: "var(--text-primary)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <UserPlus size={16} color="var(--color-primary)" /> Recruit Event Staff Crew
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.78rem", marginBottom: "1rem", lineHeight: 1.4 }}>
                  Search and add campus classmates as organizers or volunteers for this event.
                </p>
                
                <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: "220px", position: "relative" }}>
                    <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)" }} />
                    <input
                      type="text"
                      value={crewSearch}
                      onChange={(e) => setCrewSearch(e.target.value)}
                      placeholder="Type classmate's name or email (min 2 chars)..."
                      className="input-field"
                      style={{ paddingLeft: "2.5rem" }}
                    />
                  </div>
                  <div style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      style={{
                        padding: "0.6rem 0.85rem",
                        borderRadius: "var(--radius-sm)",
                        border: "2px solid var(--border)",
                        background: "var(--bg-card)",
                        color: "var(--text-primary)",
                        fontFamily: "var(--font-sans)",
                        fontWeight: 600,
                        fontSize: "0.78rem"
                      }}
                    >
                      <option value="volunteer">Volunteer</option>
                      <option value="organizer">Organizer</option>
                    </select>
                  </div>
                </div>

                {/* Search Results List */}
                {crewSearch.trim().length >= 2 && (
                  <div style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)", borderRadius: "var(--radius-md)", padding: "0.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {crewSearchResults === undefined ? (
                      <div style={{ display: "flex", justifyContent: "center", padding: "1rem" }}>
                        <Loader2 size={18} color="var(--color-primary)" style={{ animation: "spin 1s linear infinite" }} />
                      </div>
                    ) : crewSearchResults.length === 0 ? (
                      <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", padding: "0.5rem", textAlign: "center" }}>
                        No students found matching your query.
                      </div>
                    ) : (
                      crewSearchResults.map((u) => {
                        // Filter out existing crew members
                        const isAlreadyCrew = (staff ?? []).some((member) => member.userId === u._id);
                        return (
                          <div
                            key={u._id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "0.5rem 0.75rem",
                              background: "rgba(255,255,255,0.03)",
                              borderRadius: "var(--radius-sm)",
                              border: "1px solid rgba(255,255,255,0.05)",
                              flexWrap: "wrap",
                              gap: "0.5rem"
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <img
                                src={u.imageUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=6366f1&color=fff`}
                                alt={u.name}
                                style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }}
                              />
                              <div>
                                <div style={{ fontWeight: 700, fontSize: "0.8rem", color: "var(--text-primary)" }}>{u.name}</div>
                                <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>{u.email}</div>
                              </div>
                            </div>

                            <div>
                              {isAlreadyCrew ? (
                                <span className="badge" style={{ fontSize: "0.65rem", padding: "0.1rem 0.5rem", background: "rgba(255,255,255,0.06)", color: "var(--text-muted)" }}>
                                  Already Crew
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleInviteCrew(u._id)}
                                  disabled={processing}
                                  className="btn-primary"
                                  style={{ fontSize: "0.68rem", padding: "0.3rem 0.75rem" }}
                                >
                                  Recruit
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Current Crew Roster */}
            <div className="glass-card" style={{ padding: "1.5rem" }}>
              <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "1.25rem", color: "var(--text-primary)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <UserCheck size={16} color="var(--color-success)" /> Active Event Crew Roster
              </h3>
              {!staff ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
                  <Loader2 size={24} color="var(--color-primary)" style={{ animation: "spin 1s linear infinite" }} />
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {staff.map((member) => {
                    if (!member.user) return null;
                    const canRemove = organizerRole === "owner" && member.role !== "owner";
                    return (
                      <div
                        key={member._id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          padding: "0.6rem 0.875rem",
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.06)",
                          borderRadius: "var(--radius-md)",
                          justifyContent: "space-between"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <img
                            src={member.user.imageUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(member.user.name)}&background=6366f1&color=fff`}
                            alt={member.user.name}
                            style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover" }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--text-primary)" }}>{member.user.name}</div>
                            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{member.user.email}</div>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <span className={`badge badge-${member.role === "owner" ? "warning" : member.role === "organizer" ? "primary" : "cyan"}`} style={{ fontSize: "0.7rem", textTransform: "capitalize" }}>
                            {member.role}
                          </span>
                          {canRemove && (
                            <button
                              onClick={() => handleRemoveCrew(member.userId, member.user.name)}
                              style={{
                                padding: "0.35rem",
                                borderRadius: "var(--radius-sm)",
                                border: "2px solid var(--border)",
                                background: "rgba(239,68,68,0.1)",
                                color: "var(--color-danger)",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "all 0.15s ease"
                              }}
                              title="Remove Crew Member"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <style jsx global>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
        @media (max-width: 768px) {
          .teams-split-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
