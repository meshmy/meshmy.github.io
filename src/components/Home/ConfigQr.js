import QRCode from 'qrcode';

/**
 * Renders a QR code as inline SVG at build time (SSR-safe, no canvas),
 * so it shows even before JS loads. Always dark-on-light, in both themes:
 * phone cameras read inverted codes unreliably. This is the one
 * documented exception to the tokens-only colour rule).
 */
export default function ConfigQr({value, size = 176, title}) {
  const qr = QRCode.create(value, {errorCorrectionLevel: 'M'});
  const n = qr.modules.size;
  const quiet = 2;
  const dim = n + quiet * 2;
  let d = '';
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (qr.modules.get(x, y)) d += `M${x + quiet} ${y + quiet}h1v1h-1z`;
    }
  }
  return (
    <svg
      role="img"
      aria-label={title}
      width={size}
      height={size}
      viewBox={`0 0 ${dim} ${dim}`}
      shapeRendering="crispEdges"
      style={{display: 'block', background: '#fff', borderRadius: 8}}>
      <title>{title}</title>
      <path d={d} fill="#000" />
    </svg>
  );
}
