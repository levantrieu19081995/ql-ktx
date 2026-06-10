"use client";

import React, { useState } from "react";

export default function ExcelImporter() {
  return (
    <div>
      <input
        type="file"
        onChange={() => console.log("🔥 WORKED")}
        style={{ padding: 20, border: "2px solid red" }}
      />
    </div>
  );
}
