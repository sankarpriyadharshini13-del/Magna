"use client";

import { useEffect, useState } from "react";
import { formatInr } from "@/lib/format";
import { Badge } from "../ui";
import { BagIcon, ArrowIcon } from "@/components/ui/Icons";

interface ProductPreviewCardProps {
  name: string;
  tag: string;
  packSize: string;
  description: string;
  price: string;
  originalPrice: string;
  images: string[];
  visible: boolean;
  color: string;
}

export default function ProductPreviewCard({
  name,
  tag,
  packSize,
  description,
  price,
  originalPrice,
  images,
  visible,
  color,
}: ProductPreviewCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
        setIsAnimating(false);
      }, 500);
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  const priceNum = Number(price);
  const originalNum = Number(originalPrice);
  const off = originalNum > priceNum ? Math.round(((originalNum - priceNum) / originalNum) * 100) : 0;

  return (
    <article
      style={{
        borderRadius: "1rem",
        backgroundColor: "#fff",
        padding: "0.3rem",
        boxShadow: "0 10px 30px -12px rgba(20, 42, 30, 0.18)",
        border: "1px solid rgba(27, 61, 42, 0.06)",
        maxWidth: 280,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {/* Image section */}
      <div
        style={{
          position: "relative",
          aspectRatio: "1",
          overflow: "hidden",
          borderRadius: "0.8rem",
          backgroundColor: "#F0E8D6",
        }}
      >
        {images.length > 0 ? (
          <div
            style={{
              width: "100%",
              height: "100%",
              backgroundImage: `url(${images[currentIndex]})`,
              backgroundSize: "contain",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              opacity: isAnimating ? 0.5 : 1,
              transition: "opacity 0.5s ease",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "grid",
              placeItems: "center",
              background: `linear-gradient(135deg, ${color}22, ${color}55)`,
              color: color,
              fontSize: 28,
              fontWeight: 700,
              fontFamily: "var(--font-serif)",
            }}
          >
            {name.charAt(0)}
          </div>
        )}

        {/* Labels */}
        <div
          style={{
            position: "absolute",
            inset: "0.3rem 0.3rem auto",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "0.3rem",
          }}
        >
          {tag && (
            <span
              style={{
                borderRadius: "99px",
                backgroundColor: "rgba(251, 247, 239, 0.95)",
                padding: "0.1rem 0.3rem",
                fontSize: "7px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                color: "#E8672A",
                boxShadow: "0 10px 30px -12px rgba(20, 42, 30, 0.18)",
                backdropFilter: "blur(4px)",
              }}
            >
              {tag}
            </span>
          )}
          {off > 0 && (
            <span
              style={{
                borderRadius: "99px",
                backgroundColor: "#2F5A3C",
                padding: "0.1rem 0.3rem",
                fontSize: "7px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#FBF7EF",
                boxShadow: "0 10px 30px -12px rgba(20, 42, 30, 0.18)",
              }}
            >
              {off}% off
            </span>
          )}
        </div>

        {/* View details overlay */}
        <span
          style={{
            pointerEvents: "none",
            position: "absolute",
            bottom: "0.3rem",
            right: "0.3rem",
            display: "inline-flex",
            transform: "translateY(0.5rem)",
            alignItems: "center",
            gap: "0.15rem",
            borderRadius: "99px",
            backgroundColor: "rgba(27, 61, 42, 0.9)",
            padding: "0.15rem 0.3rem",
            fontSize: "9px",
            fontWeight: 600,
            color: "#FBF7EF",
            opacity: 0,
            boxShadow: "0 10px 30px -12px rgba(20, 42, 30, 0.18)",
            transition: "all 0.3s",
          }}
        >
          View details <ArrowIcon width={9} height={9} />
        </span>
      </div>

      {/* Product info */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "0.3rem 0.3rem 0.15rem 0.3rem",
        }}
      >
        <p
          style={{
            fontSize: "7px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.18em",
            color: "rgba(27, 26, 21, 0.45)",
          }}
        >
          {packSize || "Pack size to be confirmed"}
        </p>
        <h3
          style={{
            marginTop: "0.05rem",
            fontFamily: "var(--font-serif)",
            fontSize: "14px",
            fontWeight: 700,
            color: "#1B3D2A",
            lineHeight: 1.1,
          }}
        >
          {name}
        </h3>
        <p
          style={{
            marginTop: "0.15rem",
            fontSize: "10px",
            lineHeight: 1.3,
            color: "rgba(27, 26, 21, 0.6)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {description || "No description yet."}
        </p>
        <div
          style={{
            marginTop: "0.3rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.15rem",
            fontSize: "10px",
            fontWeight: 600,
            color: "#1B3D2A",
            textDecoration: "underline",
          }}
        >
          View details <ArrowIcon width={10} height={10} />
        </div>
        <div
          style={{
            marginTop: "0.4rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.3rem",
            borderTop: "1px solid rgba(27, 61, 42, 0.07)",
            paddingTop: "0.4rem",
          }}
        >
          <div style={{ minWidth: 0 }}>
            {originalNum > priceNum ? (
              <span style={{ display: "inline-flex", flexWrap: "wrap", alignItems: "baseline", gap: "0.25rem" }}>
                <s
                  style={{
                    fontSize: "9px",
                    fontWeight: 500,
                    color: "rgba(27, 26, 21, 0.45)",
                    textDecoration: "line-through",
                    textDecorationColor: "rgba(27, 26, 21, 0.4)",
                  }}
                >
                  {formatInr(originalNum)}
                </s>
                <span
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#1B3D2A",
                  }}
                >
                  {priceNum > 0 ? formatInr(priceNum) : "₹—"}
                </span>
              </span>
            ) : (
              <span
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#1B3D2A",
                }}
              >
                {priceNum > 0 ? formatInr(priceNum) : "₹—"}
              </span>
            )}
          </div>
          <button
            type="button"
            style={{
              minHeight: "1.5rem",
              flexShrink: 0,
              padding: "0 0.5rem",
              fontSize: "11px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              borderRadius: "99px",
              backgroundColor: "#E8672A",
              color: "#fff",
              border: "none",
              cursor: visible ? "pointer" : "not-allowed",
              opacity: visible ? 1 : 0.5,
              boxShadow: "0 10px 30px -12px rgba(20, 42, 30, 0.18)",
              transition: "transform 0.2s",
            }}
            disabled={!visible}
          >
            <BagIcon width={10} height={10} /> Add
          </button>
        </div>
        {!visible && (
          <p
            style={{
              marginTop: "0.2rem",
              fontSize: "9px",
              color: "rgba(27, 26, 21, 0.6)",
            }}
          >
            Hidden — customers won&apos;t see this until you switch on "Visible on website".
          </p>
        )}
      </div>
    </article>
  );
}
