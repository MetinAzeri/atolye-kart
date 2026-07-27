import React from "https://esm.sh/react@18";
import { AboutSection } from "../components/AboutSection.js";
import { FamilySection } from "../components/FamilySection.js";

export function AboutPage() {
  return React.createElement(React.Fragment, null, React.createElement(AboutSection), React.createElement(FamilySection));
}
