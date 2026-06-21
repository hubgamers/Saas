# Creation d'une organisation

Cette note explique le flux de creation d'une organisation et le pattern a reutiliser pour les autres actions du SaaS.

Le principe: la page ne porte pas le metier. Elle affiche le formulaire. La Server Action adapte la requete Next.js. Le use case orchestre la feature. Le domain garde les regles. Le repository parle a Prisma. Le DTO controle ce qui ressort vers l'UI.

## Vue rapide

```txt
src/app/dashboard/(main)/orgs/create/page.tsx
  -> src/app/dashboard/(main)/orgs/create/actions.ts
    -> src/modules/organizations/application/use-cases/create-organization.use-case.ts
      -> src/modules/organizations/domain/organization.rules.ts
      -> src/modules/organizations/domain/organization.repository.ts
        -> src/modules/organizations/infrastructure/prisma-organization.repository.ts
      -> src/modules/organizations/application/dtos/organization.dto.ts
```

## 1. La page: afficher le formulaire

Fichier:

```txt
src/app/dashboard/(main)/orgs/create/page.tsx
```

Son role est volontairement limite:

- afficher les champs;
- brancher le formulaire sur une Server Action;
- rester lisible et proche de l'UI.

Exemple:

```tsx
<form action={createOrg} className="space-y-6">
  <Input id="name" name="name" required />
  <Input id="slug" name="slug" required />
  <Input id="logoUrl" name="logoUrl" type="url" />
  <Button type="submit">Creer mon organisation</Button>
</form>
```

La page ne doit pas importer Prisma, Supabase, ni appeler directement le repository.

## 2. La Server Action: adapter Next.js

Fichier:

```txt
src/app/dashboard/(main)/orgs/create/actions.ts
```

Son role:

- lire le `FormData`;
- verifier l'utilisateur courant;
- valider l'entree HTTP avec `zod`;
- appeler le use case;
- revalider les routes;
- rediriger.

Elle peut importer Next.js, Supabase, `redirect`, `revalidatePath`, etc. C'est la couche faite pour ca.

```ts
const organization: OrganizationDto = await createOrganizationUseCase({
  name: fields.name,
  ownerId: owner.id,
  slug: fields.slug,
  logoUrl: fields.logoUrl || undefined,
  organizationRepository: prismaOrganizationRepository,
})

revalidatePath("/dashboard")
revalidatePath("/dashboard/orgs")
redirect(`/dashboard/org/${organization.id}`)
```

Point important: l'action peut retourner ou manipuler un `OrganizationDto`, mais elle ne doit pas devenir le coeur metier de la creation.

## 3. Le use case: orchestrer la feature

Fichier:

```txt
src/modules/organizations/application/use-cases/create-organization.use-case.ts
```

Son role:

- recevoir une entree deja explicite, pas un `FormData`;
- appliquer les regles du domaine;
- appeler le repository;
- convertir le resultat en DTO.

```ts
export async function createOrganizationUseCase(input: Input) {
  assertCanCreateOrganization()

  const organization = await input.organizationRepository.create({
    name: input.name,
    ownerId: input.ownerId,
    slug: input.slug,
    logoUrl: input.logoUrl,
  })

  return toOrganizationDto(organization)
}
```

Le use case ne doit pas importer Next.js, React, Supabase cookies, `redirect`, `revalidatePath` ou Prisma directement.

## 4. Les rules: garder les invariants metier

Fichier:

```txt
src/modules/organizations/domain/organization.rules.ts
```

Aujourd'hui, `assertCanCreateOrganization()` est encore un placeholder. A terme, c'est ici qu'on met les regles qui doivent etre vraies quel que soit le point d'entree.

Exemples de regles possibles:

- le nom doit avoir une longueur minimale;
- le slug doit respecter un format;
- certains slugs sont reserves;
- un utilisateur gratuit ne peut creer qu'une organisation;
- un owner suspendu ne peut plus creer d'organisation.

Ces regles ne doivent pas etre cachees dans la page ou dans Prisma.

## 5. Le repository: parler a la base

Fichier:

```txt
src/modules/organizations/infrastructure/prisma-organization.repository.ts
```

Le domain declare le contrat:

```ts
export interface OrganizationRepository {
  findMany(): Promise<Organization[]>
  create(data: NewOrganization): Promise<Organization>
}
```

L'infrastructure implemente ce contrat avec Prisma:

```ts
const organization = await prisma.organization.create({
  data,
  include: {
    owner: {
      select: {
        id: true,
        username: true,
        email: true,
      },
    },
  },
})
```

Le repository peut mapper les details Prisma vers les types du domaine. Par exemple, Prisma renvoie `logoUrl: null`, alors que le domaine prefere `logoUrl?: string`.

## 6. Le DTO: controler ce qui sort

Fichier:

```txt
src/modules/organizations/application/dtos/organization.dto.ts
```

Le DTO est l'objet expose vers l'interface. Il evite de renvoyer un objet Prisma brut a la page.

```ts
export type OrganizationDto = {
  id: string
  name: string
  ownerId: string
  owner?: RelationReferenceDto
  slug: string
  logoUrl?: string
  createdAt: string
}
```

`toOrganizationDto()` transforme les dates et garde uniquement les champs utiles.

## Pourquoi ne pas appeler le use case directement depuis la page ?

Pour une lecture serveur simple, une page peut appeler une query de presentation. Pour une mutation de formulaire, il faut une Server Action.

La Server Action est le point d'entree HTTP de Next.js. Elle gere les details de framework:

- `FormData`;
- session et cookies;
- `redirect`;
- `revalidatePath`;
- erreurs de validation liees au formulaire.

Le use case reste pur cote application. Il doit pouvoir etre teste sans Next.js.

## Template pour une nouvelle action

Pour une nouvelle feature, suivre ce schema:

```txt
src/app/.../page.tsx
  - affiche le formulaire
  - appelle une Server Action avec action={...}

src/app/.../actions.ts ou src/modules/<module>/presentation/actions.ts
  - "use server"
  - lit FormData
  - verifie auth/session
  - valide l'entree
  - appelle le use case
  - revalidatePath / redirect

src/modules/<module>/application/use-cases/create-*.use-case.ts
  - orchestre la creation
  - appelle les rules
  - appelle le repository
  - retourne un DTO

src/modules/<module>/domain/*.rules.ts
  - contient les invariants metier

src/modules/<module>/domain/*.repository.ts
  - definit le port

src/modules/<module>/infrastructure/prisma-*.repository.ts
  - implemente le port avec Prisma

src/modules/<module>/application/dtos/*.dto.ts
  - definit ce qui sort vers l'UI
```

## Checklist

Avant de considerer une action terminee:

- la page n'importe pas Prisma;
- la Server Action verifie l'utilisateur cote serveur;
- les donnees du formulaire sont validees;
- les regles metier importantes sont dans `domain/*.rules.ts`;
- le use case ne depend pas de Next.js;
- le repository normalise les differences Prisma/domaine;
- l'UI recoit un DTO, pas un objet Prisma brut;
- `tsc --noEmit` passe.

