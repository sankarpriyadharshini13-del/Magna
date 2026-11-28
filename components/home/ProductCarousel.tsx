"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { Product } from "@/types";

/** Animated product image carousel */
export default function ProductCarousel({ products }: { products: Product[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (products.length <= 1) return;

    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % products.length);
        setIsAnimating(false);
      }, 500);
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, [products.length]);

  const currentProduct = products[currentIndex];
  const imageSrc = currentProduct?.image || (currentProduct?.images && currentProduct.images[0]) || "/images/placeholder-product.jpg";
  const imageAlt = currentProduct?.imageAlt || "Magna Eco Bites product";

  return (
    <figure className="relative mx-auto aspect-[575/720] w-full max-w-[575px] overflow-hidden rounded-[2rem] bg-forest-card shadow-lift lg:mx-0 lg:aspect-auto lg:h-full lg:rounded-[2.75rem]">
      <div className="relative h-full w-full">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority
          sizes="(min-width:1024px) 575px, 92vw"
          className={`object-cover transition-opacity duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}
        />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[28%] bg-gradient-to-t from-forest-deep/70 to-transparent" />
      </div>

      <figcaption className="absolute bottom-[4.5%] left-[6.5%] right-4 text-cream">
        <p className="font-display text-[1.4rem] leading-tight sm:text-[1.65rem] lg:text-[1.9rem]">Made with care <span aria-hidden="true">•</span> Packed with love</p>
        <p className="mt-1 text-[0.85rem] text-cream/70 sm:mt-1.5 sm:text-[0.95rem]">{currentProduct?.name || "Our Products"}</p>
      </figcaption>

      {/* Carousel indicators */}
      {products.length > 1 && (
        <div className="absolute bottom-[25%] left-1/2 flex -translate-x-1/2 gap-2">
          {products.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 w-2 rounded-full transition-all ${
                index === currentIndex ? "bg-cream w-6" : "bg-cream/40 hover:bg-cream/60"
              }`}
              aria-label={`Show product ${index + 1}`}
            />
          ))}
        </div>
      )}
    </figure>
  );
}
