/**
 * Firmware releases shown on /firmware. Newest first. The first entry is the "latest" release.
 *
 * To publish a release (hosted on GitHub Releases):
 *   1. On GitHub, create the release and attach the firmware .exe as an asset.
 *   2. Right-click the asset on the release page, "Copy link address", and paste it
 *      into `url` below. The Download button then starts that download directly.
 *      (GitHub renames spaces in file names to dots, so always copy the real link.)
 *   3. Add (or edit) the entry's version, date, size and notes.
 *   4. Optional: paste the SHA-256 checksum so users can verify the download.
 *
 * Without a `url`, the button falls back to a file in public/firmware/ (`file`, with
 * `available: true`); with neither, the page shows a "being prepared" message.
 *
 * The version, date and notes below are placeholders. Replace them with real ones.
 */
export interface FirmwareRelease {
  version: string;
  /** ISO date, e.g. "2026-10-13" */
  date: string;
  /** Direct link to the release asset on GitHub, e.g. https://github.com/OWNER/REPO/releases/download/v7.0.0/JUNO.1.FIRMWARE.7.0.0.exe */
  url?: string;
  /** Fallback: file name inside public/firmware/ (used only when `url` is empty). */
  file: string;
  /** Human-readable size, e.g. "412 KB". Leave empty if unknown. */
  size?: string;
  /** SHA-256 checksum of the file. Leave empty to hide. */
  sha256?: string;
  available: boolean;
  notes: string[];
}

export const firmwareReleases: FirmwareRelease[] = [
  {
    version: "7.1.3",
    date: "2026-10-25",
    // Paste the GitHub release asset link here to make the Download button live:
    url: "https://github.com/gamerclash244-bit/juno.1/releases/download/update/JUNO.1.FIRMWARE.7.1.3.exe",
    file: "JUNO.1 FIRMWARE 7.1.3.exe",
    size: "57.7 MB",
    sha256: "",
    available: false,
    notes: [
  "Latest firmware release for JUNO.1.",
  "Introduced single-footswitch control for a smoother live performance workflow.",
  "Reduced response delay compared to previous firmware versions.",
  "Improved synchronization workflow for performances with singers.",
  "You can restart a sequence from the beginning without manually stopping playback.",
  "Improved recovery from timing mismatches during live performances.",
  "Enhanced performance control for more seamless stage operation.",
  "Streamlined footswitch interaction to reduce manual intervention.",
  "Improved overall workflow reliability during live use.",
  "Focused on faster control, smoother transitions, and uninterrupted performance flow."
  ],
  },
];

/** Where the download for a release lives, or undefined if it is not published yet. */
export function downloadHref(r: FirmwareRelease): string | undefined {
  if (r.url) return r.url;
  return r.available ? `/firmware/${encodeURIComponent(r.file)}` : undefined;
}

export const updateSteps: { title: string; body: string }[] = [
  {
    title: "Download the Updater",
    body: "Save the latest firmware file to your computer.",
  },
  {
    title: "Open the Updater",
    body: "Just double click the .exe file.",
  },
  {
    title: "Connect Your JUNO.1 to PC",
    body: "After you Plug JUNO.1 in pc, in the Updater O Turns green.",
  },
  {
    title: "UPDATE",
    body: "Click Update Button in the Updater, thats it Your JUNO.1 is in its latest firmware.",
  },
];
