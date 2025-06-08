"use client";
export function ImagesSection() {
  return (
    <section className="relative w-full overflow-hidden px-8">
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center gap-16">
        <div className="w-full text-center flex flex-col items-center gap-10">
          <div className="flex flex-col items-center justify-center gap-8">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-[2.9rem]">
              Understand words with images
            </h1>
            <p className="text-xl text-muted-foreground md:text-[1.4rem] max-w-[40rem]">
              Some words are just easier to understand by visualizing them.
              We've got that too.
            </p>
          </div>
          <ImagesCard />
        </div>
      </div>
    </section>
  );
}

function ImagesCard() {
  const images = [
    "https://images.unsplash.com/photo-1607373086441-6597c47dc090?q=80&w=1936&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1554111954-66a45f3de9b4?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1548236747-047a3b12bab3?q=80&w=1644&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1561599966-da3b485f4701?q=80&w=1738&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1561599966-8502be763660?q=80&w=1888&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1713292423480-fdc9c4c329ae?q=80&w=1937&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1563901845905-78b873da8e61?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    // "https://images.unsplash.com/photo-1668454312598-f3bf42a4d575?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    // "https://images.unsplash.com/photo-1748885287144-ec9ea38c8ea5?q=80&w=1873&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    // "https://images.unsplash.com/photo-1610364551359-a8d602bfb4af?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
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
