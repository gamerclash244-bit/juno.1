import { useEffect } from "react";
import { SITE } from "../constants/site";

/** Sets the browser tab title. Pass nothing for the home page. */
export function usePageTitle(title?: string): void {
  useEffect(() => {
    document.title = title
      ? `${title} | ${SITE.name}`
      : `${SITE.name} | ${SITE.tagline}`;
  }, [title]);
}
