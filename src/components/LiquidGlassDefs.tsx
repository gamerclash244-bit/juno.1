interface Props {
  /** Data-URL displacement maps, one per glass surface. Empty string = not ready yet. */
  barMap: string;
  pillMap: string;
}

/** A displacement filter with a touch of chromatic aberration (R, G, B bend by slightly different amounts). */
function Filter({ id, map, scale }: { id: string; map: string; scale: number }): React.ReactElement {
  return (
    <filter id={id} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
      <feImage href={map} preserveAspectRatio="none" result="map" />
      <feDisplacementMap in="SourceGraphic" in2="map" scale={scale} xChannelSelector="R" yChannelSelector="G" result="dispR" />
      <feColorMatrix in="dispR" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
      <feDisplacementMap in="SourceGraphic" in2="map" scale={scale * 0.92} xChannelSelector="R" yChannelSelector="G" result="dispG" />
      <feColorMatrix in="dispG" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
      <feDisplacementMap in="SourceGraphic" in2="map" scale={scale * 0.84} xChannelSelector="R" yChannelSelector="G" result="dispB" />
      <feColorMatrix in="dispB" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
      <feBlend in="r" in2="g" mode="screen" result="rg" />
      <feBlend in="rg" in2="b" mode="screen" />
    </filter>
  );
}

/** Hidden SVG that holds the refraction filters referenced by backdrop-filter in index.css. */
function LiquidGlassDefs({ barMap, pillMap }: Props): React.ReactElement {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: "absolute" }}>
      <defs>
        {barMap && <Filter id="juno-lg-bar" map={barMap} scale={46} />}
        {pillMap && <Filter id="juno-lg-pill" map={pillMap} scale={34} />}
      </defs>
    </svg>
  );
}

export default LiquidGlassDefs;
