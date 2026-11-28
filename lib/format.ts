export const formatInr = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

/**
 * Names are stored exactly as the customer typed them, but the admin panel shows them with the
 * first letter of every word in capitals — "arun kumar" → "Arun Kumar", "ARUN KUMAR" → "Arun Kumar".
 */
export const titleCase = (value: string) =>
  value
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/(^|[\s'.-])([a-z])/g, (_match, prefix: string, letter: string) => prefix + letter.toUpperCase());
