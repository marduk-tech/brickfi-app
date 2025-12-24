// Extract title and content, handling various HTML formats
export interface ParsedProCon {
  title: string;
  content: string;
}

export function parseProConHtml(html: string): ParsedProCon {
  if (!html || typeof html !== "string") {
    return { title: "", content: "" };
  }

  // Extract title from <b> tags
  const titleMatch = html.match(/<b>(.*?)<\/b>/i);
  const title = titleMatch ? titleMatch[1] : "";

  // Extract content after first <br> tag, handling whitespace and &nbsp;
  const contentMatch = html.match(/<\/b>(?:\s|&nbsp;)*<br\s*\/?>([\s\S]*)$/i);

  let content = "";
  if (contentMatch) {
    content = contentMatch[1].trim();
  } else {
    // Fallback: try to extract content after </b> tag
    const fallbackMatch = html.match(/<\/b>([\s\S]*)$/i);
    if (fallbackMatch) {
      content = fallbackMatch[1]
        .replace(/^(?:\s|&nbsp;|<br\s*\/?>)+/gi, "")
        .trim();
    }
  }

  return { title, content };
}

export function decodeHtmlEntities(html: string): string {
  if (typeof document === "undefined") {
    // Server-side fallback
    return html
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'");
  }

  const temp = document.createElement("div");
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || html;
}
