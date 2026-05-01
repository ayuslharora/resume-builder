import { useContext } from "react";
import { ResumeContext } from "./resume-context";

export function useResume() {
  return useContext(ResumeContext);
}
