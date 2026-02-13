"use client";

import { useMemo, useState } from "react";
import style from "./friends.module.css";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type FriendPoint = {
  time: string;
  stress: number;
  label: string;
};

type Friend = {
  id: string;
  name: string;
  icon: string;
  data: FriendPoint[];
};

const friends: Friend[] = [
  {
    id: "ava",
    name: "Ava",
    icon: "A",
    data: [
      { time: "09:00", stress: 2, label: "moderate" },
      { time: "11:00", stress: 3, label: "stressed" },
      { time: "13:00", stress: 2, label: "moderate" },
      { time: "16:00", stress: 1, label: "calm" },
      { time: "19:00", stress: 1, label: "calm" },
    ],
  },
  {
    id: "liam",
    name: "Liam",
    icon: "L",
    data: [
      { time: "09:00", stress: 1, label: "calm" },
      { time: "11:00", stress: 2, label: "moderate" },
      { time: "13:00", stress: 2, label: "moderate" },
      { time: "16:00", stress: 3, label: "stressed" },
      { time: "19:00", stress: 2, label: "moderate" },
    ],
  },
  {
    id: "noah",
    name: "Noah",
    icon: "N",
    data: [
      { time: "09:00", stress: 3, label: "stressed" },
      { time: "11:00", stress: 3, label: "stressed" },
      { time: "13:00", stress: 2, label: "moderate" },
      { time: "16:00", stress: 2, label: "moderate" },
      { time: "19:00", stress: 1, label: "calm" },
    ],
  },
  {
    id: "mia",
    name: "Mia",
    icon: "M",
    data: [
      { time: "09:00", stress: 1, label: "calm" },
      { time: "11:00", stress: 1, label: "calm" },
      { time: "13:00", stress: 2, label: "moderate" },
      { time: "16:00", stress: 1, label: "calm" },
      { time: "19:00", stress: 1, label: "calm" },
    ],
  },
];

export default function Friends() {
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedFriend = useMemo(
    () => friends.find((friend) => friend.id === selectedFriendId) ?? null,
    [selectedFriendId],
  );

  const filteredFriends = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return friends;
    return friends.filter((friend) =>
      friend.name.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  return (
    <div className={style.container}>
      <div className={style.header}>
        <h1 className={style.title}>Friends</h1>
        <p className={style.subtitle}>
          Tap a friend to view their demo stress trend
        </p>
      </div>

      <div className={style.searchBar}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={style.searchInput}
          placeholder="Search friends..."
        />
      </div>

      <div className={style.cards}>
        {filteredFriends.map((friend, idx) => (
          <button
            key={friend.id}
            className={style.card}
            onClick={() => setSelectedFriendId(friend.id)}
            type="button"
          >
            <span className={style.friendIcon}>{friend.icon}</span>
            <div className={style.friend_info}>
              <span className={style.friendName}>{friend.name}</span>
              <div className={`${style.activity}`}>
                <div
                  className={`${style.ball}  ${idx % 2 === 0 ? style.offline : ""}`}
                ></div>
                <span className={style.status}>
                  {idx % 2 === 0 ? "Offline" : "Active"}
                </span>
              </div>
            </div>
          </button>
        ))}
        {filteredFriends.length === 0 && (
          <div className={style.emptyState}>No friends found.</div>
        )}
      </div>

      <div
        className={`${style.sheetOverlay} ${selectedFriend ? style.sheetOverlayOpen : ""}`}
        onClick={() => setSelectedFriendId(null)}
      />

      <section
        className={`${style.sheet} ${selectedFriend ? style.sheetOpen : ""}`}
      >
        {selectedFriend && (
          <>
            <div className={style.sheetTop}>
              <div className={style.sheetHeading}>
                <span className={`${style.friendIcon} ${style.open_menu_icon}`}>
                  {selectedFriend.icon}
                </span>
                <div>
                  <h2>{selectedFriend.name}</h2>
                  <p>Daily stress trend (demo)</p>
                </div>
              </div>
              <button
                type="button"
                className={style.closeButton}
                onClick={() => setSelectedFriendId(null)}
              >
                Close
              </button>
            </div>

            <div className={style.chartWrap}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={selectedFriend.data}
                  margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="friendStressGradient"
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
                    tickFormatter={(value) => {
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
                    formatter={(
                      value: number | undefined,
                      _name: string,
                      props: any,
                    ) => [props.payload.label, "Level"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="stress"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    fill="url(#friendStressGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
