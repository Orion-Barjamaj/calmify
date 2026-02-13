"use client";

import { useState, useEffect } from "react";
import style from "./dashboard.module.css";
import Image from "next/image";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  addReading,
  getRecentReadings,
  saveStreakData,
  loadStreakData,
  type StressReading,
  type StreakData,
} from "../utils/db";
import BreathingExercise from "../components/breathing-exercise/breathing-exercise";

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [showBreathingCta, setShowBreathingCta] = useState(false);
  const [isBreathingOpen, setIsBreathingOpen] = useState(false);
  const [chartData, setChartData] = useState<StressReading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    lastCheckDate: "",
    bestStreak: 0,
    totalCalmDays: 0,
    weeklyCalendar: {},
  });

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load streak data
        const savedStreak = await loadStreakData();
        if (savedStreak) {
          setStreakData(savedStreak);
        }

        // Load recent readings for chart
        const readings = await getRecentReadings(10);
        setChartData(readings);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save streak data whenever it changes
  useEffect(() => {
    if (!isLoading) {
      saveStreakData(streakData).catch((error) => {
        console.error("Error saving streak data:", error);
      });
    }
  }, [streakData, isLoading]);

  const updateStreak = (level: string) => {
    const today = new Date().toDateString();
    const lastCheck = new Date(streakData.lastCheckDate).toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (today === lastCheck) {
      return;
    }

    const newCalendar = { ...streakData.weeklyCalendar };
    newCalendar[today] = level === "calm";

    if (level === "calm") {
      let newStreak = streakData.currentStreak;

      if (lastCheck === yesterday) {
        newStreak = streakData.currentStreak + 1;
      } else if (lastCheck !== today) {
        newStreak = 1;
      }

      setStreakData({
        currentStreak: newStreak,
        lastCheckDate: today,
        bestStreak: Math.max(newStreak, streakData.bestStreak),
        totalCalmDays: streakData.totalCalmDays + 1,
        weeklyCalendar: newCalendar,
      });
    } else {
      setStreakData({
        currentStreak: 0,
        lastCheckDate: today,
        bestStreak: streakData.bestStreak,
        totalCalmDays: streakData.totalCalmDays,
        weeklyCalendar: newCalendar,
      });
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/analyze`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setResult(data);
    setShowModal(true);
    const isStressed = data?.level?.toString().toLowerCase() === "stressed";
    setShowBreathingCta(isStressed);
    setIsBreathingOpen(false);

    // Update streak
    updateStreak(data.level);

    // Save reading to database
    const reading: StressReading = {
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      timestamp: Date.now(),
      stress: data.level === "calm" ? 1 : data.level === "moderate" ? 2 : 3,
      label: data.level,
      message: data.message,
    };

    try {
      await addReading(reading);
      // Reload recent readings for chart
      const readings = await getRecentReadings(10);
      setChartData(readings);
    } catch (error) {
      console.error("Error saving reading:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] ?? null;
    setFile(selectedFile);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const getStressEmoji = (level: string) => {
    if (!level) return "📊";
    const normalized = level.toLowerCase();
    if (normalized === "calm") return "😊";
    if (normalized === "moderate") return "😐";
    if (normalized === "stressed") return "😰";
    return "📊";
  };

  const getLast7Days = () => {
    const days = [];
    const dayNames = ["S", "M", "T", "W", "T", "F", "S"];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000);
      const dateString = date.toDateString();
      const dayName = dayNames[date.getDay()];
      const dayNumber = date.getDate();

      days.push({
        dayName,
        dayNumber,
        dateString,
        wasCalm: streakData.weeklyCalendar[dateString] === true,
        wasChecked: streakData.weeklyCalendar[dateString] !== undefined,
        isToday: dateString === new Date().toDateString(),
      });
    }

    return days;
  };

  if (isLoading) {
    return (
      <div className={style.container}>
        <div className={style.loading}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={style.container}>
      <header className={style.topBar}>
        <div className={style.profile}>
          <Image
            src="/pfp.avif"
            alt="profile"
            width={56}
            height={56}
            className={style.profileIcon}
          />
          <span className={style.profileName}>
            Hello, <span style={{ fontWeight: "bold" }}>Orion</span>!
          </span>
          <div className={style.notification}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-bell-icon lucide-bell"
            >
              <path d="M10.268 21a2 2 0 0 0 3.464 0" />
              <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
            </svg>
          </div>
        </div>
      </header>

      <div className={style.streakContainer}>
        <div className={style.streakCard}>
          <div className={style.streakInfo}>
            <Image src="/fire.png" width={40} height={40} alt="fire"></Image>
            <div className={style.streakNumber}>
              {streakData.currentStreak || 4}
            </div>
            <div className={style.streakLabel}>Day Streak</div>
          </div>
        </div>
        <div className={style.streakCard}>
          <div className={style.streakInfo}>
            <Image
              src="/medal (1).png"
              width={40}
              height={40}
              alt="best"
            ></Image>

            <div className={style.streakNumber}>
              {streakData.bestStreak || 12}
            </div>
            <div className={style.streakLabel}>Best Streak</div>
          </div>
        </div>
        <div className={style.streakCard}>
          <div className={style.streakInfo}>
            <Image src="/calm2.png" width={40} height={40} alt="calm"></Image>

            <div className={style.streakNumber}>
              {streakData.totalCalmDays || 5}
            </div>
            <div className={style.streakLabel}>Calm Days</div>
          </div>
        </div>
      </div>

      <div className={style.weeklyCalendar}>
        <div className={style.calendarHeader}>
          <span className={style.calendarTitle}>This Week</span>
          <span className={style.calendarSubtitle}>
            Keep your streak going!
          </span>
        </div>
        <div className={style.calendarDays}>
          {getLast7Days().map((day, index) => (
            <div
              key={index}
              className={`${style.calendarDay} ${
                day.wasCalm
                  ? style.calmDay
                  : day.wasChecked
                    ? style.notCalmDay
                    : style.uncheckedDay
              } ${day.isToday ? style.today : ""}`}
            >
              <div className={style.dayBall}>
                <div className={style.dayName}>{day.dayName}</div>
                <div className={style.dayNumber}>{day.dayNumber}</div>
              </div>
              {day.wasCalm && <div className={style.checkMark}>✓</div>}
            </div>
          ))}
        </div>
      </div>

      <div className={style.dashboard_container}>
        <div className={style.stressChartCard}>
          <div className={style.stressChartHeader}>
            <div className={style.stressChartTitle}>
              <div className={style.stressChartBadge}>
                <div className={style.icon_chart}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-chart-column-big-icon lucide-chart-column-big"
                  >
                    <path d="M3 3v16a2 2 0 0 0 2 2h16" />
                    <rect x="15" y="5" width="4" height="12" rx="1" />
                    <rect x="7" y="8" width="4" height="9" rx="1" />
                  </svg>
                </div>
              </div>
              <div>
                <h2>Your progress</h2>
                <p>Daily stress trend</p>
              </div>
            </div>
          </div>
          <div className={style.chart}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="stressGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                      <stop
                        offset="95%"
                        stopColor="#82ca9d"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="time" tick={{ fontSize: 12 }} stroke="#666" />
                  <YAxis
                    domain={[0, 4]}
                    ticks={[1, 2, 3]}
                    tickFormatter={(value: any) => {
                      if (value === 1) return "Calm";
                      if (value === 2) return "Moderate";
                      if (value === 3) return "Stressed";
                      return "";
                    }}
                    tick={{ fontSize: 12 }}
                    stroke="#666"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #ccc",
                      borderRadius: "8px",
                      padding: "8px",
                    }}
                    formatter={(value: any, name: any, props: any) => [
                      props.payload.label,
                      "Level",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="stress"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    fill="url(#stressGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className={style.emptyChart}>
                <span className={style.emptyChartIcon}>📊</span>
                <p>Upload a file to start tracking</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={style.upload}>
        <span>Measure stress</span>
        <div className={style.fileInputWrapper}>
          <label
            htmlFor="fileInput"
            className={`${style.fileInputLabel} ${file ? style.hasFile : ""}`}
          >
            <span className={style.fileIcon}>📄</span>
            {file ? file.name : "Choose a text file"}
          </label>
          <input
            id="fileInput"
            type="file"
            accept=".txt"
            onChange={handleFileChange}
            className={style.hiddenInput}
          />
          <button
            onClick={handleUpload}
            disabled={!file}
            className={style.uploadButton}
          >
            Analyze Stress
          </button>
        </div>
      </div>

      {showBreathingCta && (
        <div className={style.breathingPrompt}>
          <p className={style.breathingPromptText}>
            You are feeling stressed. Take a quick guided breathing exercise.
          </p>
          <button
            className={style.breathingPromptButton}
            onClick={() => setIsBreathingOpen((current) => !current)}
          >
            {isBreathingOpen
              ? "Hide breathing exercise"
              : "Take breathing exercises"}
          </button>
        </div>
      )}

      <BreathingExercise show={showBreathingCta && isBreathingOpen} />

      {showModal && result && (
        <div className={style.modalOverlay} onClick={closeModal}>
          <div className={style.modal} onClick={(e) => e.stopPropagation()}>
            <div className={style.modalIcon}>
              {getStressEmoji(result.level)}
            </div>
            <h2 className={style.modalTitle}>Stress Analysis Complete</h2>
            <div
              className={`${style.stressLevel} ${style[result.level?.toLowerCase()]}`}
            >
              {result.level || "Unknown"}
            </div>
            <p className={style.modalMessage}>
              {result.message || "Your stress analysis has been completed."}
            </p>

            {result.level === "calm" && (
              <div className={style.streakUpdate}>
                <span className={style.streakUpdateIcon}>🔥</span>
                <span className={style.streakUpdateText}>
                  {streakData.currentStreak === 1
                    ? "Streak started!"
                    : `${streakData.currentStreak} day streak!`}
                </span>
              </div>
            )}
            {result.level !== "calm" &&
              streakData.currentStreak === 0 &&
              streakData.lastCheckDate && (
                <div className={style.streakBroken}>
                  <span className={style.streakBrokenIcon}>💔</span>
                  <span className={style.streakBrokenText}>
                    Streak broken. Stay calm tomorrow!
                  </span>
                </div>
              )}

            <button className={style.closeButton} onClick={closeModal}>
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
