export function getKoreaQuizTime(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit"
  }).formatToParts(now);
  const get = (type) => parts.find((part) => part.type === type)?.value;
  const date = `${get("year")}-${get("month")}-${get("day")}`;
  const hour = Number(new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul", hour: "2-digit", hourCycle: "h23"
  }).format(now));
  const slot = hour < 8 ? 1 : hour < 16 ? 2 : 3;
  const ranges = { 1: "00:00 – 08:00", 2: "08:00 – 16:00", 3: "16:00 – 24:00" };
  return { date, hour, slot, range: ranges[slot] };
}
