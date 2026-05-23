export function getOverlayAppearance(style: string | null | undefined): {
  wrapperClass: string;
  shadowClass: string;
} {
  let wrapperClass = "w-full max-w-[95%]";
  let shadowClass = "";

  if (style === "right") {
    wrapperClass += " mr-4 mt-4";
    shadowClass = "shadow-[8px_-8px_0px_#6366f1]";
  } else if (style === "left") {
    wrapperClass += " ml-4 mt-4";
    shadowClass = "shadow-[-8px_-8px_0px_#6366f1]";
  } else {
    wrapperClass += " mt-2";
    shadowClass = "shadow-lg";
  }

  return { wrapperClass, shadowClass };
}
