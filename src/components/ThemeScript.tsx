/**
 * Applies the stored theme before first paint. Without this, a dark-theme
 * user sees a white flash on every page load.
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

  return <script dangerouslySetInnerHTML={{ __html: js }} />;
}
