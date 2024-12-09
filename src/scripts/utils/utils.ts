type Nullable<T> = T | null | undefined;

function checkVisibility(target: string | HTMLElement, id: string): boolean {
  const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  return el?.getAttribute("id") === id && el?.checkVisibility();
}

function formatDate(date: Date): string {
  const pad = (num: number) => String(num).padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

export { checkVisibility, formatDate, type Nullable };
