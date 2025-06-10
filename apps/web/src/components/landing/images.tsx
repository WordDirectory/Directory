"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { LandingSection } from "./section";

export function ImagesSection() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <LandingSection
      title="Understand words with images"
      titleClassName="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-[2.9rem]"
      description="Some words are just easier to understand by visualizing them. We've got that too."
      descriptionClassName="text-lg text-muted-foreground sm:text-xl md:text-[1.4rem] max-w-[40rem] px-4 sm:px-0"
      gap="custom"
      customGaps={{
        main: "gap-8 sm:gap-16",
        header: "gap-6 sm:gap-10",
        titleDesc: "gap-4 sm:gap-8",
      }}
      contentMaxWidth=""
    >
      {isMobile ? <MobileFloatingSection /> : <DesktopImagesCard />}
    </LandingSection>
  );
}

function MobileFloatingSection() {
  const [mounted, setMounted] = useState(false);
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateScreenSize = () => {
      setScreenSize({ width: window.innerWidth, height: window.innerHeight });
    };

    updateScreenSize();
    setMounted(true);

    window.addEventListener("resize", updateScreenSize);
    return () => window.removeEventListener("resize", updateScreenSize);
  }, []);

  const imageUrls = [
    "https://images.unsplash.com/photo-1607373086441-6597c47dc090?q=80&w=1936&auto=format&fit=crop&ixlib=rb-4.1.0",
    "https://images.unsplash.com/photo-1554111954-66a45f3de9b4?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0",
    "https://images.unsplash.com/photo-1548236747-047a3b12bab3?q=80&w=1644&auto=format&fit=crop&ixlib=rb-4.1.0",
    "https://images.unsplash.com/photo-1561599966-8502be763660?q=80&w=1888&auto=format&fit=crop&ixlib=rb-4.1.0",
    "https://images.unsplash.com/photo-1683014969916-8db7295d7f03?q=80&w=1674&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  ];

  // Dynamic spread based on screen size
  const getSpreadMultiplier = () => {
    if (screenSize.width < 480) return 0.6; // Very close on small phones
    if (screenSize.width < 640) return 0.8; // Closer on phones
    if (screenSize.width < 768) return 1.0; // Normal on tablets
    return 1.2; // More spread on larger screens
  };

  const spreadMultiplier = getSpreadMultiplier();

  const images = [
    {
      id: 1,
      x: -120 * spreadMultiplier,
      y: -150 * spreadMultiplier,
      rotation: 6,
      src: imageUrls[0],
    },
    {
      id: 2,
      x: 140 * spreadMultiplier,
      y: 120 * spreadMultiplier,
      rotation: -13,
      src: imageUrls[1],
    },
    {
      id: 3,
      x: -100 * spreadMultiplier,
      y: 140 * spreadMultiplier,
      rotation: 21,
      src: imageUrls[2],
    },
    {
      id: 4,
      x: 120 * spreadMultiplier,
      y: -120 * spreadMultiplier,
      rotation: -12,
      src: imageUrls[3],
    },
    {
      id: 5,
      x: -140 * spreadMultiplier,
      y: 60 * spreadMultiplier,
      rotation: 10,
      src: imageUrls[4],
    },
  ];

  if (!mounted) return null;

  return (
    <div className="w-full h-[60vh] relative overflow-hidden">
      {/* Floating Images */}
      <div className="absolute inset-0">
        {images.map((img, index) => (
          <motion.div
            key={img.id}
            className="absolute top-1/2 left-1/2 w-32 h-32 rounded-xl overflow-hidden shadow-lg opacity-60"
            initial={{
              opacity: 0,
              x: img.x - 64,
              y: img.y + 100,
              rotateZ: img.rotation,
              scale: 0.5,
            }}
            animate={{
              opacity: 0.6,
              x: img.x - 64,
              y: img.y - 64,
              rotateZ: img.rotation,
              scale: 1,
            }}
            transition={{
              type: "spring",
              damping: 20,
              stiffness: 100,
              delay: index * 0.1,
            }}
          >
            <motion.img
              src={img.src}
              alt="Obelisk example"
              className="w-full h-full object-cover"
              animate={{
                y: [0, -4, 0],
                x: [0, 2, -2, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.2 + 1,
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Centered Badge Overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            type: "spring",
            damping: 20,
            stiffness: 300,
            delay: 0.5,
          }}
          className="relative z-10"
        >
          <div className="bg-accent/50 backdrop-blur-sm border border-border rounded-2xl px-8 py-6 shadow-2xl">
            <motion.h3
              className="text-4xl font-bold text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              Obelisk
            </motion.h3>
            <motion.p
              className="text-base text-muted-foreground text-center mt-3 max-w-[280px]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
            >
              A super tall, skinny stone tower that comes to a point at the top
            </motion.p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function DesktopImagesCard() {
  const images = [
    "https://images.unsplash.com/photo-1607373086441-6597c47dc090?q=80&w=1936&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1554111954-66a45f3de9b4?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1548236747-047a3b12bab3?q=80&w=1644&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1561599966-da3b485f4701?q=80&w=1738&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1561599966-8502be763660?q=80&w=1888&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1713292423480-fdc9c4c329ae?q=80&w=1937&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1563901845905-78b873da8e61?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  ];

  return (
    <div className="w-full h-[25rem] bg-background rounded-3xl border-2 flex items-center justify-between overflow-hidden">
      <div className="flex flex-col gap-4 text-left w-[50%] p-9 h-full">
        <h3 className="text-4xl font-medium">Obelisk</h3>
        <p className="text-2xl text-muted-foreground">
          A super tall, skinny stone tower that comes to a point at the top,
          kind of like a giant stone needle...
        </p>
      </div>
      <div className="w-[50%] h-full flex gap-4 p-4">
        {Array.from({ length: 2 }, (_, columnIndex) => (
          <div
            key={columnIndex}
            className={`flex-1 flex flex-col gap-6 ${columnIndex === 1 ? "-mt-[13rem]" : ""}`}
          >
            {(columnIndex === 1 ? [...images].reverse() : images).map(
              (image, i) => {
                // Manual opacity values
                let opacity = 0.2; // default
                if (columnIndex === 0) {
                  // Left column
                  if (i === 0) opacity = 0.61;
                  else if (i === 1) opacity = 1.0;
                  else if (i === 2) opacity = 0.16;
                } else {
                  // Right column
                  if (i === 1) opacity = 0.37;
                  else if (i === 2) opacity = 0.79;
                  else if (i === 3) opacity = 0.3;
                }

                return (
                  <img
                    key={`${columnIndex}-${image}-${i}`}
                    src={image}
                    alt="Obelisk example"
                    className="w-full object-cover rounded-lg aspect-square"
                    style={{ opacity }}
                  />
                );
              }
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
