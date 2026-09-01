import Script from "next/script";

/**
 * Applies the stored theme before first paint. Without this, a dark-theme
 * user sees a white flash on every page load.
 *
 * Uses next/script with `beforeInteractive` rather than a bare <script> tag:
 * React never executes a raw script element when it renders on the client, so
 * the inline form only worked while the whole tree was server-rendered.
 */
export function ThemeScript() {
  const js = `
(function(){
  try {
    var t = localStorage.getItem('icetrack-theme');
    if (t !== 'dark' && t !== 'light') t = 'light';
    document.documentElement.dataset.theme = t;
  } catch (e) {
    document.documentElement.dataset.theme = 'light';
  }
})();`.trim();

  return (
    <Script id="icetrack-theme" strategy="beforeInteractive">
      {js}
    </Script>
  );
}
