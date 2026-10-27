const philippinePesoFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
});

export function formatPhilippinePeso(value: number | string): string {
  return philippinePesoFormatter.format(Number(value) || 0);
}
