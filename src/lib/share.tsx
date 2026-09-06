"use client";

/**
 * Where a page can be shared, and the marks that make each button
 * recognisable at a glance.
 *
 * Shared by every share control on the site so a new network is added in one
 * place. Plain intent URLs, not vendor SDKs: those load third-party script
 * that tracks the reader whether or not they ever click.
 *
 * Instagram and TikTok are missing because neither accepts a share URL —
 * their links get pasted, which is what a copy button is for.
 */
const brand = {
  className: "h-4 w-4 shrink-0 fill-current",
  viewBox: "0 0 24 24",
} as const;

function XIcon() {
  return (
    <svg {...brand}>
      <path d="M18.9 1.2h3.7l-8.1 9.2 9.5 12.5h-7.4l-5.8-7.6-6.7 7.6H.4l8.6-9.8L0 1.2h7.6l5.2 6.9zm-1.3 19.5h2L6.5 3.2H4.3z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg {...brand}>
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07" />
    </svg>
  );
}

function RedditIcon() {
  return (
    <svg {...brand}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 3.31 1.34 6.31 3.52 8.48l-2.2 2.2c-.4.4-.12 1.09.45 1.09H12c6.63 0 12-5.37 12-12S18.63 0 12 0m5.01 10.2a1.5 1.5 0 0 1 .49 2.92 3 3 0 0 1 .04.5c0 2.5-2.92 4.54-6.52 4.54s-6.52-2.03-6.52-4.54q0-.25.05-.5a1.5 1.5 0 1 1 1.65-2.45 8 8 0 0 1 4.36-1.38l.82-3.88a.31.31 0 0 1 .37-.24l2.7.57a1.09 1.09 0 1 1-.12.6l-2.41-.51-.74 3.47a8 8 0 0 1 4.3 1.38 1.5 1.5 0 0 1 1.53-.48M8.67 12.5a1.09 1.09 0 1 0 0 2.18 1.09 1.09 0 0 0 0-2.18m6.66 0a1.09 1.09 0 1 0 0 2.18 1.09 1.09 0 0 0 0-2.18m-.4 3.65a.29.29 0 0 1 .4.42 4.6 4.6 0 0 1-3.33 1.04 4.6 4.6 0 0 1-3.33-1.04.29.29 0 1 1 .4-.42c.6.6 1.87.81 2.93.81s2.33-.21 2.93-.81" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg {...brand}>
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97s-.47-.15-.67.15-.77.96-.94 1.16-.35.22-.65.07a8.1 8.1 0 0 1-2.39-1.47 9 9 0 0 1-1.65-2.06c-.17-.3-.02-.46.13-.61s.3-.35.45-.52.2-.3.3-.5a.55.55 0 0 0-.03-.52c-.07-.15-.67-1.61-.92-2.21s-.49-.5-.67-.51h-.57a1.1 1.1 0 0 0-.8.37 3.35 3.35 0 0 0-1.04 2.48 5.8 5.8 0 0 0 1.22 3.09 13.3 13.3 0 0 0 5.1 4.5c.71.3 1.27.49 1.7.63a4.1 4.1 0 0 0 1.88.12 3.07 3.07 0 0 0 2.01-1.42 2.5 2.5 0 0 0 .17-1.41c-.07-.13-.27-.2-.57-.35M12.05 21.8h-.01a9.9 9.9 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1 1.51-12.4 9.86 9.86 0 0 1 16.83 6.98 9.87 9.87 0 0 1-9.96 10.05M20.52 3.45A11.8 11.8 0 0 0 12.05 0C5.5 0 .17 5.33.17 11.89a11.8 11.8 0 0 0 1.58 5.94L.06 24l6.3-1.65a11.9 11.9 0 0 0 5.68 1.45h.01c6.55 0 11.88-5.33 11.89-11.89a11.8 11.8 0 0 0-3.47-8.46" />
    </svg>
  );
}

/**
 * Where the card can go.
 *
 * Plain intent URLs, not vendor SDKs: those load third-party script that
 * tracks the reader whether or not they ever click. A link costs nothing and
 * works with JavaScript off.
 *
 * Instagram and TikTok are missing because neither accepts a share URL —
 * their links get pasted, which is what the Copy button is for.
 */
export const NETWORKS = [
  {
    name: "X",
    color: "#000000",
    Icon: XIcon,
    href: (url: string, text: string) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        text,
      )}&url=${encodeURIComponent(url)}`,
  },
  {
    name: "Facebook",
    color: "#1877F2",
    Icon: FacebookIcon,
    // Facebook takes no text: it reads the page's own Open Graph tags.
    href: (url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    name: "Reddit",
    color: "#FF4500",
    Icon: RedditIcon,
    href: (url: string, text: string) =>
      `https://www.reddit.com/submit?url=${encodeURIComponent(
        url,
      )}&title=${encodeURIComponent(text)}`,
  },
  {
    name: "WhatsApp",
    color: "#25D366",
    Icon: WhatsAppIcon,
    href: (url: string, text: string) =>
      `https://api.whatsapp.com/send?text=${encodeURIComponent(
        `${text} ${url}`,
      )}`,
  },
] as const;
