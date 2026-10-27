import { Suspense, lazy } from "react";
import ReviewComposer from "../components/ReviewComposer";
import Hero from "../components/Hero";
import ScrubStatement from "../components/ScrubStatement";
import ImageViewer from "../components/ImageViewer";
import SpecShowcase from "../components/SpecShowcase";
import FeatureList from "../components/FeatureList";
import Reviews from "../components/Reviews";
import FirmwareBand from "../components/FirmwareBand";
import { SHOW_3D_VIEWER } from "../constants/site";
import { usePageTitle } from "../hooks/usePageTitle";

// The 3D viewer pulls in three.js. It is only fetched when SHOW_3D_VIEWER is true.
const ModelViewer = lazy(() => import("../components/ModelViewer"));

function Home(): React.ReactElement {
  usePageTitle();

  return (
    <>
      <Hero />
      <ScrubStatement />
      <ImageViewer />
      <SpecShowcase />
      {SHOW_3D_VIEWER && (
        <Suspense fallback={<div className="h-[80vh]" aria-hidden />}>
          <ModelViewer />
        </Suspense>
      )}
      <FeatureList />
      <Reviews />
      <ReviewComposer />
      <FirmwareBand />
    </>
  );
}

export default Home;
