type NavigationProps = {
  active?: "home" | "guide" | "people" | "events";
};

const links = [
  { id: "guide", label: "Guide", href: "/feedboard", accent: "text-[#95FF8D]" },
  { id: "people", label: "People", href: "/people", accent: "text-[#FF595E]" },
  { id: "events", label: "Events", href: "/events", accent: "text-[#C5C7C9]" },
];

export default function Navigation({ active = "home" }: NavigationProps) {
  return (
    <nav className="w-full flex items-start justify-between py-8 px-6 md:px-10">
      <a
        href="/"
        className={`font-righteous text-2xl md:text-3xl leading-tight tracking-tight ${
          active === "home" ? "text-fyf-cream" : "text-fyf-cream/80 hover:text-fyf-cream"
        } transition`}
      >
        FYF
      </a>

      <div className="text-center">
        <p className="font-righteous text-2xl md:text-3xl leading-tight text-fyf-cream tracking-tight uppercase">
          Zeit = Vermögen
        </p>
        <p className="font-righteous text-2xl md:text-3xl leading-tight text-fyf-cream tracking-tight uppercase">
          Change
        </p>
      </div>

      <div className="flex flex-col items-end gap-1 text-right">
        {links.map(({ id, label, href, accent }) => {
          const isActive = active === id;
          return (
            <a
              key={id}
              href={href}
              className={[
                "font-righteous text-2xl md:text-[26px] leading-tight tracking-tight transition",
                accent,
                isActive ? "underline underline-offset-4" : "opacity-80 hover:opacity-100",
              ].join(" ")}
            >
              {label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
