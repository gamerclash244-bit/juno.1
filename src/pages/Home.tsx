import { Suspense, lazy } from "react";
import Hero from "../components/Hero";
import ScrubStatement from "../components/ScrubStatement";
import FeatureList from "../components/FeatureList";
import FirmwareBand from "../components/FirmwareBand";
import { usePageTitle } from "../hooks/usePageTitle";

// The 3D viewer pulls in three.js, so load it after the hero has painted
const ModelViewer = lazy(() => import("../components/ModelViewer"));

function Home(): React.ReactElement {
  usePageTitle();

  return (
    <>
      <Hero />
      <ScrubStatement />
      <Suspense fallback={<div className="h-[80vh]" aria-hidden />}>
        <ModelViewer />
      </Suspense>
      <FeatureList />
      <FirmwareBand />
    </>
  );
}

export default Home;
