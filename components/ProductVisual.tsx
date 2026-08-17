import Image from "next/image";
import { Product, ProductCategory } from "@/lib/types";

export default function ProductVisual({
                                          product,
                                          image,
                                          category,
                                          className = "",
                                          seed = 0,
                                          size = 400,
                                      }: {
    product?: Product;
    image?: string;
    category?: ProductCategory;
    className?: string;
    seed?: number;
    size?: number;
}) {

    const imageSrc = image ?? product?.images?.[0];

    if (imageSrc) {
        return (
            <div className={`relative aspect-square overflow-hidden ${className}`}>
                <Image
                    src={imageSrc}
                    alt={product?.name ?? "LUNEX"}
                    fill
                    sizes="100vw"
                    className="object-cover"
                />
            </div>
        );
    }

    // Generate procedural SVG based on seed
    const rng = (s: number) => {
        let x = Math.sin(s) * 10000;
        return x - Math.floor(x);
    };

    const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
    const lineCount = 8 + Math.floor(rng(seed) * 8);

    for (let i = 0; i < lineCount; i++) {
        lines.push({
            x1: rng(seed + i * 4) * size,
            y1: rng(seed + i * 4 + 1) * size,
            x2: rng(seed + i * 4 + 2) * size,
            y2: rng(seed + i * 4 + 3) * size,
        });
    }

    return (
        <svg
            viewBox={`0 0 ${size} ${size}`}
            className={`w-full h-full ${className}`}
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect width={size} height={size} fill="#000000" />
            {lines.map((line, i) => (
                <line
                    key={i}
                    x1={line.x1}
                    y1={line.y1}
                    x2={line.x2}
                    y2={line.y2}
                    stroke="#0D01DD"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    opacity={0.6 + rng(seed + i * 100) * 0.4}
                />
            ))}
        </svg>
    );
}