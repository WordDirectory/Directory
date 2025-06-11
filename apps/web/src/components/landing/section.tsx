import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface LandingSectionProps {
  title: ReactNode;
  description?: ReactNode;
  afterDescription?: ReactNode; // For badges, buttons, etc.
  children?: ReactNode; // Main content
  titleClassName?: string;
  descriptionClassName?: string;
  contentMaxWidth?: string; // For constraining main content width
  gap?: "sm" | "md" | "lg" | "xl" | "custom"; // Controls spacing between elements
  customGaps?: {
    main?: string;
    header?: string;
    titleDesc?: string;
  };
  textAlign?: "left" | "center";
}

const gapClasses = {
  sm: {
    main: "gap-8",
    header: "gap-6 sm:gap-8",
    titleDesc: "gap-4 sm:gap-6",
  },
  md: {
    main: "gap-12",
    header: "gap-8 sm:gap-10",
    titleDesc: "gap-5 sm:gap-8",
  },
  lg: {
    main: "gap-16",
    header: "gap-10",
    titleDesc: "gap-5 sm:gap-8",
  },
  xl: {
    main: "gap-20",
    header: "gap-12",
    titleDesc: "gap-6 sm:gap-10",
  },
  custom: {
    main: "",
    header: "",
    titleDesc: "",
  },
};

export function LandingSection({
  title,
  description,
  afterDescription,
  children,
  titleClassName = "",
  descriptionClassName = "",
  contentMaxWidth,
  gap = "md",
  customGaps,
  textAlign = "center",
}: LandingSectionProps) {
  const gaps = gap === "custom" && customGaps ? customGaps : gapClasses[gap];

  return (
    <section className="relative w-full overflow-hidden px-8">
      <div
        className={cn(
          "max-w-2xl mx-auto flex flex-col items-center justify-center",
          gaps.main
        )}
      >
        <div
          className={cn(
            "w-full flex flex-col items-center",
            gaps.header,
            textAlign === "center" ? "text-center" : "text-left"
          )}
        >
          <div
            className={cn(
              "flex flex-col items-center justify-center",
              gaps.titleDesc
            )}
          >
            <h1
              className={cn(
                "text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-[2.9rem]",
                titleClassName
              )}
            >
              {title}
            </h1>
            {description && (
              <p
                className={cn(
                  "text-xl text-muted-foreground md:text-[1.4rem] max-w-[40rem]",
                  descriptionClassName
                )}
              >
                {description}
              </p>
            )}
          </div>
          {afterDescription}
        </div>

        {children && (
          <div
            className={cn(
              "w-full flex flex-col",
              contentMaxWidth || "max-w-[40rem]"
            )}
          >
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
