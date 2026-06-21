export function assertCanCreateOrganization(input: {
  name: string
  slug: string
}) {
  if (input.name.trim().length < 2) {
    throw new Error("Le nom de l'organisation est trop court.")
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug)) {
    throw new Error("Le slug est invalide.")
  }
}