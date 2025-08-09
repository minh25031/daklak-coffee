import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

const AccordionContext = React.createContext<{
  openItems: string[];
  toggleItem: (value: string) => void;
} | null>(null);

export function Accordion({
  type = "multiple",
  children,
  className,
}: {
  type?: "multiple" | "single",
  children: React.ReactNode,
  className?: string,
}) {
  const [openItems, setOpenItems] = React.useState<string[]>([])

  const toggleItem = (value: string) => {
    setOpenItems((prev) => {
      if (type === "single") {
        return prev.includes(value) ? [] : [value]
      } else {
        return prev.includes(value)
          ? prev.filter((item) => item !== value)
          : [...prev, value]
      }
    })
  }

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem }}>
      <div className={cn("space-y-2", className)}>{children}</div>
    </AccordionContext.Provider>
  )
}

export function AccordionItem({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) {
  return (
    <div data-value={value} data-accordion-value={value} className="border rounded-md overflow-hidden transition-all">
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<any>, { accordionValue: value })
          : child
      )}
    </div>
  );
}

export function AccordionTrigger({
  children,
  className,
  accordionValue,
}: {
  children: React.ReactNode;
  className?: string;
  accordionValue?: string;
}) {
  const context = React.useContext(AccordionContext);
  const value = accordionValue || "";

  // Đảm bảo boolean thật
  const isOpen = context ? context.openItems.includes(value) : false;

  return (
    <button
      type="button" // ✅ fix 1: khai báo type
      onClick={() => context?.toggleItem(value)}
      className={cn(
        "w-full flex items-center justify-between px-4 py-2 font-medium text-left focus:outline-none transition-all cursor-pointer",
        isOpen ? "bg-gray-100" : "bg-white",
        className
      )}
      aria-expanded={isOpen} // ✅ boolean
      aria-controls={`content-${value}`}
    >
      <span>{children}</span>
      <ChevronDown
        className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")}
      />
    </button>
  );
}

export function AccordionContent({
  children,
  accordionValue,
}: {
  children: React.ReactNode;
  accordionValue?: string;
}) {
  const context = React.useContext(AccordionContext);

  const value = accordionValue || "";
  const isOpen = context ? context.openItems.includes(value) : false;

  return (
    <div
      id={`content-${value}`}
      className={cn(
        "transition-all px-4 overflow-hidden",
        isOpen ? "max-h-[1000px] py-2 opacity-100" : "max-h-0 py-0 opacity-0"
      )}
      aria-hidden={!isOpen} // ✅ boolean thật
    >
      {children}
    </div>
  )
}
