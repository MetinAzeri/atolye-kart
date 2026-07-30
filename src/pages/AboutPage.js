import React from "react";
import { AboutSection } from "../components/AboutSection.js";
import { FamilySection } from "../components/FamilySection.js";

export function AboutPage() {
  return React.createElement(React.Fragment, null, React.createElement(AboutSection), React.createElement(FamilySection));
}
