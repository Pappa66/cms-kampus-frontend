export async function fetchMenu() {
  const res = await fetch("http://localhost:4000/api/menu");
  if (!res.ok) throw new Error("Failed to fetch menu");
  return res.json();
}