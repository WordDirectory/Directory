"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function FloatingImages() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Real Unsplash images
  const imageUrls = [
    "https://images.unsplash.com/photo-1607373086441-6597c47dc090?q=80&w=1936&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1554111954-66a45f3de9b4?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1548236747-047a3b12bab3?q=80&w=1644&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1561599966-da3b485f4701?q=80&w=1738&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1561599966-8502be763660?q=80&w=1888&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1713292423480-fdc9c4c329ae?q=80&w=1937&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1563901845905-78b873da8e61?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  ];

  // Smaller, tighter positioning for mobile and desktop
  const images = [
    { id: 1, x: -80, y: -60, z: 0, rotation: 15, src: imageUrls[0] },
    { id: 2, x: 120, y: 30, z: -50, rotation: -10, src: imageUrls[1] },
    { id: 3, x: -50, y: 100, z: 25, rotation: 25, src: imageUrls[2] },
    { id: 4, x: 80, y: -80, z: -25, rotation: -20, src: imageUrls[3] },
    { id: 5, x: 0, y: 0, z: 50, rotation: 5, src: imageUrls[4] },
    { id: 6, x: -120, y: 50, z: -75, rotation: 30, src: imageUrls[5] },
    { id: 7, x: 100, y: -30, z: 35, rotation: -15, src: imageUrls[6] },
  ];

  if (!mounted) return null;

  return (
    <div className="w-full h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 overflow-hidden relative">
      <div
        className="absolute inset-0"
        style={{
          perspective: "1000px",
          perspectiveOrigin: "center center",
        }}
      >
        {images.map((img, index) => (
          <FloatingImage
            key={img.id}
            src={img.src}
            delay={index * 0.2}
            x={img.x}
            y={img.y}
            z={img.z}
            rotation={img.rotation}
          />
        ))}
      </div>
    </div>
  );
}

interface FloatingImageProps {
  src: string;
  delay: number;
  x: number;
  y: number;
  z: number;
  rotation: number;
}

function FloatingImage({ src, delay, x, y, z, rotation }: FloatingImageProps) {
  return (
    <motion.div
      className="absolute top-1/2 left-1/2 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32 rounded-lg overflow-hidden shadow-2xl"
      initial={{
        opacity: 0,
        x: x - 32,
        y: y + 200, // Start 200px below final position
        rotateX: 0,
        rotateY: 0,
        rotateZ: rotation,
      }}
      animate={{
        opacity: 1,
        x: x - 32,
        y: y - 32, // Move up to final position
        rotateX: [0, 5, -5, 0],
        rotateY: [0, 10, -10, 0],
        rotateZ: rotation,
        z: z,
      }}
      transition={{
        opacity: {
          type: "spring",
          damping: 15,
          stiffness: 300,
          delay,
        },
        y: {
          type: "spring",
          damping: 20,
          stiffness: 100,
          delay,
        },
        x: {
          type: "spring",
          damping: 20,
          stiffness: 100,
          delay,
        },
        rotateX: {
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: delay + 1,
        },
        rotateY: {
          duration: 6,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: delay + 1.5,
        },
      }}
      style={{
        transformStyle: "preserve-3d",
      }}
    >
      <motion.img
        src={src}
        alt={`Floating architectural image`}
        className="w-full h-full object-cover"
        whileHover={{
          scale: 1.1,
          rotateY: 15,
          transition: { type: "spring", stiffness: 300, damping: 20 },
        }}
      />

      {/* Floating animation */}
      <motion.div
        className="absolute inset-0"
        animate={{
          y: [0, -8, 0],
          x: [0, 4, -4, 0],
        }}
        transition={{
          duration: 3 + Math.random() * 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: delay + 2,
        }}
      />
    </motion.div>
  );
}
