import { PageHeader } from "antd";
import React from "react";

// displays a page header

export default function Header() {
  return (
    <a href="https://github.com/ztnark/877-Cash-Now" target="_blank" rel="noopener noreferrer">
      <PageHeader
        title="877 CASH NOW"
        subTitle=""
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
