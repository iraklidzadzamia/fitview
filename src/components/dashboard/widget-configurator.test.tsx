// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { WidgetConfigurator } from "./WidgetConfigurator";

describe("WidgetConfigurator", () => {
  it("renders UTC usage reset message", () => {
    render(<WidgetConfigurator />);
    expect(screen.getByText(/Usage resets on the 1st of each month \(UTC\)/)).toBeTruthy();
  });
});
