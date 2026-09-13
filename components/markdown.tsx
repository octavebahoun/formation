import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ComponentProps, ReactNode } from "react";

const YT_RE = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/;

function extractYouTubeId(url?: string): string | null {
  if (!url) return null;
  const m = url.match(YT_RE);
  return m ? m[1] : null;
}

function YouTubeEmbed({ id }: { id: string }) {
  return (
    <div className="my-6 aspect-video overflow-hidden rounded-sm border border-[var(--line-strong)] bg-black">
      <iframe
        src={`https://www.youtube.com/embed/${id}`}
        title="Vidéo YouTube"
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

type PProps = ComponentProps<"p">;
type AProps = ComponentProps<"a">;

export function Markdown({ children }: { children: string | null }) {
  if (!children || children.trim() === "") {
    return (
      <p className="text-[13px] text-[var(--muted)] italic">
        Rien à afficher.
      </p>
    );
  }

  return (
    <div className="prose-md">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children, ...rest }: PProps) => {
            // Paragraphe contenant uniquement un lien YouTube -> embed
            const arr = Array.isArray(children) ? children : [children];
            const clean = arr.filter(
              (c: ReactNode) => !(typeof c === "string" && c.trim() === "")
            );
            if (clean.length === 1) {
              const only = clean[0] as ReactNode;
              if (
                typeof only === "object" &&
                only !== null &&
                "props" in only
              ) {
                const child = only as { props?: { href?: string } };
                const yt = extractYouTubeId(child.props?.href);
                if (yt) return <YouTubeEmbed id={yt} />;
              }
            }
            return <p {...rest}>{children}</p>;
          },
          a: ({ href, children, ...rest }: AProps) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              {...rest}
            >
              {children}
            </a>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
