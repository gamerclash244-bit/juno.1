/**
 * Firmware releases shown on /firmware. Newest first. The first entry is the "latest" release.
 *
 * To publish a release:
 *   1. Copy the file into  public/firmware/
 *   2. Add (or edit) an entry below. `file` must match the file name exactly.
 *   3. Set `available: true`. While it is false, the page shows a friendly
 *      "being prepared" state instead of a download button.
 *   4. Optional: paste the SHA-256 checksum so users can verify the download.
 *
 * The version, date and notes below are placeholders. Replace them with real ones.
 */
export interface FirmwareRelease {
  version: string;
  /** ISO date, e.g. "2026-10-13" */
  date: string;
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
    version: "7.0.0",
    date: "2026-10-14",
    file: "JUNO.1 FIRMWARE 7.0.0.exe",
    size: "58.2 MB",
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
