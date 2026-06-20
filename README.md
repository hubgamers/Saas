# Next.js SaaS Clean Architecture

Base Next.js 16 orientee SaaS avec une separation stricte entre le router, le metier, l'infrastructure et les points d'entree presentation.

La documentation complete de l'architecture est ici: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Structure

```txt
src/
  app/                         # Router Next.js uniquement
    dashboard/projects/page.tsx # Page serveur qui consomme le module projects
  modules/
    projects/
      domain/                  # Entites, contrats, regles metier pures
      application/             # Cas d'usage et DTO
      infrastructure/          # Adapters techniques, Prisma ici
      presentation/            # Server Actions et queries appelees par app/
  infrastructure/              # Services transverses concrets
  shared/                      # Erreurs/types partages sans dependance framework
  config/                      # Configuration applicative typee
```

Les modules metier ne doivent pas etre places dans `src/app/modules`; `src/app` reste reserve aux routes Next.js.

## Regle de dependances

Les dependances vont toujours vers le metier:

```txt
app -> modules/*/presentation -> application -> domain
                         infrastructure -> domain
```

Le domaine ne connait ni Next.js, ni Prisma, ni React. Les cas d'usage recoivent leurs ports (`ProjectRepository`) et retournent des DTO adaptes a l'interface.

## Module exemple: projects

Le module `projects` montre le flux complet d'une feature SaaS multi-tenant:

- `domain/project.rules.ts`: quotas par plan, validation du nom, slug.
- `domain/project.repository.ts`: contrat attendu par l'application.
- `application/use-cases`: orchestration des regles metier.
- `infrastructure/prisma-project.repository.ts`: implementation Prisma du port.
- `presentation/actions.ts`: Server Action Next.js avec `use server`.
- `presentation/queries.ts`: query serveur pour les pages.

La page `/dashboard/projects` appelle `connection()` avant Prisma afin d'etre rendue a la requete, pas pendant le build.

## Prisma

Le schema contient les bases SaaS:

- `User`
- `Workspace`
- `Membership`
- `Project`
- `Subscription`
- `StripeEvent`
- `Plan`
- `MemberRole`

Apres une modification du schema:

```bash
npx prisma generate
```

## Commandes

```bash
npm run dev
npm run lint
npm run build
npm run make --module invoices
npm run make:prisma -- --dry-run
npm run check:modules
npm run test:generators
```

Generer un module:

```bash
npm run make --module invoices
npm run make --entity tasks
npm run make -- module invoices number:string total:number dueAt:Date paid:boolean
npm run make -- module articles title:string status:enum:DRAFT,PUBLISHED,ARCHIVED
npm run make:module -- contacts firstName:string lastName:string email:string
npm run make -- module billing --dry-run
```

Avec `npm run make --module invoices`, la commande demande en CLI si tu veux creer des properties, puis te demande le nom, le type et si le champ est optionnel.

Si le module existe deja, la meme commande ajoute les nouvelles properties sans supprimer les anciennes:

```bash
npm run make --module invoices dueAt:Date=optional customer:ManyToOne:User
```

Types supportes par le generateur: `string`, `number`, `boolean`, `Date`, `enum:VALUE_ONE,VALUE_TWO`.
Pour un champ optionnel, utilise `=optional`, par exemple `description:string=optional` ou `status:enum:DRAFT,PUBLISHED=optional`.

Relations supportees:

```bash
npm run make -- module posts title:string author:ManyToOne:User tags:ManyToMany:Tag
```

Le generateur ajoute alors `authorId` pour le `ManyToOne` et `tagIds` pour le `ManyToMany`.

Les enums generent un type TypeScript strict dans l'entity, un lecteur `FormData` qui refuse les valeurs inconnues, et une enum Prisma quand tu lances `npm run make:prisma`.

Verifier les modules generes:

```bash
npm run check:modules
npm run test:generators
```

`test:generators` cree des modules temporaires, teste scalaires, enums, `ManyToOne`, `ManyToMany`, erreurs controlees, dry-run Prisma, puis nettoie les modules de test.

Generer les modeles Prisma manquants depuis les entities generees:

```bash
npm run make:prisma -- --dry-run
npm run make:prisma
npx prisma format
npx prisma generate
```

## Stripe

Le module `src/modules/billing` contient une integration Stripe decouplee:

- Checkout Session pour demarrer un abonnement.
- Billing Portal pour gerer l'abonnement.
- Webhook `src/app/api/stripe/webhook/route.ts` pour synchroniser Prisma.
- Table `StripeEvent` pour eviter de traiter deux fois le meme webhook.

Variables a configurer:

```bash
NEXT_PUBLIC_APP_URL="http://localhost:3000"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRO_PRICE_ID="price_..."
```

Endpoint webhook local:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Prochaines fondations utiles

- Remplacer `src/infrastructure/auth/session.ts` par une vraie session auth.
- Ajouter des tests unitaires sur `domain/` et `application/`.
- Ajouter les migrations Prisma selon la base cible.
- Ajouter une mise a jour automatique des modeles Prisma existants quand une property est ajoutee apres coup.
