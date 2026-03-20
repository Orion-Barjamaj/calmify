"use client";

import Link from "next/link";
import { useState } from "react";

export default function Home() {
  return (
    <div>
      <Link href="/dashboard">Go to dashboard</Link>
    </div>
  );
}
