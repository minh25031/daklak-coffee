// /lib/api/inventory.ts

export async function getAllInventories() {
  const token = localStorage.getItem("token");
  const res = await fetch("https://localhost:7163/api/Inventories", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return await res.json();
}

export async function getInventoryById(id: string) {
  const token = localStorage.getItem("token");
  const res = await fetch(`https://localhost:7163/api/Inventories/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return await res.json();
}
