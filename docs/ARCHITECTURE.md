# Architecture du fork SaaS Next.js

Ce document explique l'organisation du projet et les conventions a respecter quand ce depot sert de base a un nouveau SaaS.

L'objectif est simple: garder Next.js comme couche d'entree web, isoler le metier dans des modules testables, et repousser les details techniques dans l'infrastructure.

## Vue d'ensemble

```txt
src/
  app/              # Router Next.js, layouts, pages, UI de route
  modules/          # Fonctionnalites metier isolees par domaine
  infrastructure/   # Implementations techniques partagees
  shared/           # Types, erreurs et helpers transverses sans framework
  config/           # Configuration applicative
  generated/        # Code genere, notamment Prisma
  proxy.ts          # Proxy Next.js 16 pour logique avant route

prisma/
  schema.prisma     # Modele de donnees SaaS

docs/
  ARCHITECTURE.md   # Documentation de cette architecture
```

## Principe principal

Les dependances doivent aller vers le metier, jamais l'inverse.

```txt
src/app
  -> modules/*/presentation
    -> modules/*/application
      -> modules/*/domain

modules/*/infrastructure
  -> modules/*/domain
```

Le domaine ne doit pas importer Next.js, React, Prisma, `process.env`, `cookies`, `headers` ou tout autre detail technique. Il doit pouvoir etre teste avec TypeScript seul.

## `src/app`

`src/app` contient uniquement ce qui appartient au router Next.js:

- `layout.tsx`: layout racine, balises `html` et `body`, navigation globale.
- `page.tsx`: page d'accueil.
- `dashboard/page.tsx`: route dashboard.
- `dashboard/projects/page.tsx`: route qui consomme le module `projects`.
- `globals.css`: styles globaux minimaux.

Il ne doit pas y avoir de dossier `src/app/modules`. Les modules metier vivent dans `src/modules` afin de rester independants des conventions de routing Next.js.

Une page Next.js ne doit pas contenir de logique metier lourde. Elle orchestre l'interface et appelle une query ou une action depuis `modules/*/presentation`.

Exemple:

```ts
import {
  createProjectAction,
  getProjectsForCurrentWorkspace,
} from "@/modules/projects";
```

### Rendu dynamique

Next.js 16 peut prerendre les pages pendant le build. Une page qui depend d'une session, d'un workspace courant ou d'une base de donnees doit etre rendue a la requete.

Dans ce projet, `/dashboard/projects` utilise:

```ts
import { connection } from "next/server";

export default async function ProjectsPage() {
  await connection();
}
```

Cela evite d'appeler Prisma pendant `npm run build`.

## `src/modules`

Chaque module correspond a une capacite produit: `projects`, `billing`, `teams`, `invitations`, `settings`, etc.

Structure recommandee:

```txt
src/modules/<module>/
  domain/
  application/
  infrastructure/
  presentation/
  index.ts
```

Le module expose son API publique depuis `index.ts`. Les routes dans `src/app` importent depuis ce fichier, pas depuis les fichiers internes du module.

Modules presents dans ce fork:

- `projects`: exemple de feature SaaS multi-tenant.
- `billing`: integration Stripe decouplee avec Checkout, Billing Portal et webhooks.

## Couche `domain`

La couche `domain` contient le coeur metier pur.

Elle peut contenir:

- des entites TypeScript;
- des value objects;
- des regles metier;
- des erreurs metier;
- des interfaces de repository, aussi appelees ports.

Elle ne doit pas contenir:

- Prisma;
- Next.js;
- React;
- appels reseau;
- variables d'environnement;
- lecture de cookies ou headers.

Dans `projects`:

```txt
domain/
  project.entity.ts      # Forme metier d'un Project
  project.rules.ts       # Quotas, validation, slug
  project.repository.ts  # Port attendu par les cas d'usage
```

### `project.entity.ts`

Definit les types metier:

- `Project`: projet deja cree.
- `NewProject`: donnees necessaires a la creation.

Ces types representent le langage du domaine, pas forcement la structure exacte de la table SQL.

### `project.rules.ts`

Centralise les decisions metier:

- limite de projets selon le plan;
- validation du nom;
- generation du slug.

Une regle metier ne doit pas etre cachee dans une page, une Server Action ou un repository Prisma.

### `project.repository.ts`

Definit ce dont l'application a besoin pour fonctionner:

```ts
export interface ProjectRepository {
  getWorkspacePolicy(workspaceId: string): Promise<WorkspaceProjectPolicy | null>;
  findManyByWorkspaceId(workspaceId: string): Promise<Project[]>;
  create(data: NewProject): Promise<Project>;
}
```

Le domaine decrit le contrat. L'infrastructure fournit l'implementation.

## Couche `application`

La couche `application` contient les cas d'usage. Un cas d'usage orchestre une action utilisateur ou systeme:

- charger les donnees necessaires;
- appliquer les regles du domaine;
- appeler les ports;
- retourner un DTO.

Elle ne doit pas importer Prisma directement. Elle recoit un repository en parametre.

Dans `projects`:

```txt
application/
  dtos/
    project.dto.ts
  use-cases/
    create-project.use-case.ts
    list-projects.use-case.ts
```

### Use case

Exemple de flux pour `createProjectUseCase`:

1. Recupere la politique du workspace via `ProjectRepository`.
2. Verifie le quota du plan.
3. Nettoie et valide le nom.
4. Cree le slug.
5. Cree le projet via le repository.
6. Retourne un DTO.

Ce format rend le cas d'usage testable sans Next.js et sans base de donnees.

### DTO

Les DTO controlent ce qui sort du module vers l'interface.

Le projet ne retourne pas les objets Prisma bruts aux pages. Cela evite de fuiter des champs internes et limite le couplage entre UI et schema SQL.

## Couche `infrastructure`

La couche `infrastructure` contient les adapters techniques.

Dans `projects`:

```txt
infrastructure/
  prisma-project.repository.ts
```

Ce fichier implemente `ProjectRepository` avec Prisma.

Il a le droit d'importer:

- `@/infrastructure/database/prisma`;
- les types du domaine;
- des clients externes si necessaire.

Il ne doit pas contenir de regles metier. Par exemple, il peut compter les projets d'un workspace, mais il ne decide pas si le plan autorise la creation. Cette decision reste dans `domain/project.rules.ts`.

## Couche `presentation`

La couche `presentation` fait le pont entre Next.js et les cas d'usage.

Dans `projects`:

```txt
presentation/
  actions.ts  # Server Actions appelees par les formulaires ou clients
  queries.ts  # Queries serveur appelees par les pages
```

### Server Actions

`actions.ts` commence par:

```ts
"use server";
```

Une action serveur peut:

- lire la session courante;
- transformer un `FormData`;
- appeler un use case;
- revalider une route avec `revalidatePath`.

Elle ne doit pas porter les regles metier. Elle est une couche d'adaptation.

### Queries

`queries.ts` regroupe les lectures serveur destinees aux pages.

Cela evite que les pages importent directement l'infrastructure et permet de garder un point unique pour:

- recuperer la session;
- verifier les permissions;
- appeler les use cases de lecture.

## `src/infrastructure`

Ce dossier contient les services techniques partages par plusieurs modules.

```txt
src/infrastructure/
  auth/
    session.ts
  database/
    prisma.ts
    transaction.ts
```

### `auth/session.ts`

Fournit `requireAppSession()`.

Dans ce fork, c'est volontairement un stub demo:

```ts
return {
  userId: "demo-user",
  workspaceId: "demo-workspace",
};
```

Dans un vrai SaaS, ce fichier doit etre remplace par l'integration auth choisie: Auth.js, Clerk, Better Auth, Supabase Auth, solution interne, etc.

Les modules ne doivent pas lire directement les cookies partout. Ils doivent passer par une primitive de session centralisee.

### `database/prisma.ts`

Instancie Prisma avec l'adapter PostgreSQL.

Il utilise un singleton en developpement pour eviter de creer trop de connexions pendant le hot reload.

### `database/transaction.ts`

Point d'entree pour executer plusieurs operations dans une transaction.

Quand un use case doit modifier plusieurs aggregates ou tables ensemble, l'ideal est d'introduire un port transactionnel explicite plutot que de melanger Prisma dans l'application.

## `src/shared`

`shared` contient ce qui est transversal et ne depend d'aucun framework.

```txt
src/shared/domain/errors.ts
```

Exemples:

- `DomainError`: erreur de regle metier.
- `AuthorizationError`: erreur d'autorisation.

Ce dossier doit rester petit. Si un concept appartient a un module precis, il doit rester dans ce module.

## `src/config`

```txt
src/config/
  env.ts
  navigation.ts
  site.ts
```

### `env.ts`

Centralise la lecture des variables d'environnement.

Les fichiers metier ne doivent pas lire `process.env` directement. Cela garde les tests simples et evite la dispersion de la configuration.

### `site.ts`

Configuration publique du produit:

- nom;
- description;
- URL.

### `navigation.ts`

Navigation applicative partagee par le layout.

Pour un vrai SaaS avec roles et permissions, cette navigation pourra etre enrichie ou filtree cote serveur.

## `src/proxy.ts`

Next.js 16 remplace la convention `middleware.ts` par `proxy.ts`.

Dans ce projet, le proxy est volontairement neutre:

```ts
export function proxy() {
  return NextResponse.next();
}
```

Il cible:

```ts
matcher: ["/dashboard/:path*"]
```

Le proxy peut servir pour des redirections rapides, de l'aiguillage tenant ou des headers. Il ne doit pas etre le seul endroit qui protege les actions sensibles. Les Server Actions et queries doivent toujours verifier session et autorisations.

## `prisma/schema.prisma`

Le schema fournit une base multi-tenant:

```txt
User
Workspace
Membership
Project
Subscription
StripeEvent
Plan
MemberRole
BillingProvider
SubscriptionStatus
```

### `User`

Compte utilisateur.

Un user peut:

- appartenir a plusieurs workspaces via `Membership`;
- posseder des projets via `ProjectOwner`.

### `Workspace`

Tenant principal du SaaS.

Chaque workspace contient:

- un nom;
- un slug unique;
- un plan;
- un `stripeCustomerId` optionnel;
- des membres;
- des projets.
- un abonnement local synchronise depuis Stripe.

### `Membership`

Jointure entre `User` et `Workspace`.

Elle porte le role de l'utilisateur dans le workspace:

- `OWNER`;
- `ADMIN`;
- `MEMBER`.

### `Project`

Feature exemple du SaaS.

Un projet appartient a un workspace et a un owner.

La contrainte:

```prisma
@@unique([workspaceId, slug])
```

autorise deux workspaces differents a avoir le meme slug, tout en garantissant l'unicite dans un tenant.

### `Subscription`

Etat local de l'abonnement du workspace.

Le SaaS ne doit pas appeler Stripe a chaque affichage de page pour savoir si un workspace est actif. Stripe est la source externe de paiement, mais Prisma porte la projection locale utilisee par l'application.

Champs importants:

- `workspaceId`: abonnement du tenant.
- `provider`: fournisseur de paiement, `STRIPE` aujourd'hui.
- `providerCustomerId`: id client Stripe.
- `providerSubscriptionId`: id abonnement Stripe unique.
- `providerPriceId`: price Stripe actuellement associe.
- `status`: statut local de l'abonnement.
- `currentPeriodEnd`: fin de periode courante.
- `cancelAtPeriodEnd`: annulation programmee ou non.

### `StripeEvent`

Table d'idempotence des webhooks.

Stripe peut renvoyer un meme evenement plusieurs fois. Avant de traiter un webhook, le projet enregistre `event.id`. Si l'id existe deja, le handler retourne un succes sans retraiter l'evenement.

## Optimisations Prisma

Le schema inclut des index adaptes aux requetes SaaS courantes:

- `Workspace.slug` unique pour resoudre un tenant par slug.
- `Workspace.stripeCustomerId` unique pour retrouver un tenant depuis un webhook Stripe.
- `Membership.userId` et `Membership.workspaceId` pour charger les workspaces d'un utilisateur.
- `Membership.workspaceId, role` pour les verifications d'autorisation par role.
- `Project.workspaceId, createdAt` pour lister rapidement les projets d'un workspace.
- `Subscription.providerSubscriptionId` unique pour synchroniser les webhooks.
- `Subscription.status` et `Subscription.currentPeriodEnd` pour les taches billing.
- `StripeEvent.type` et `StripeEvent.processedAt` pour audit et maintenance.

Conventions Prisma du fork:

- Les pages Next.js ne doivent pas importer `prisma` directement.
- Les repositories Prisma utilisent `select` quand ils n'ont besoin que d'une projection.
- Les use cases recoivent un port, pas un `PrismaClient`.
- Les pages qui lisent la DB a la requete utilisent `connection()`.
- Les donnees Stripe sont stockees localement via webhooks, puis l'application lit Prisma.
- Les operations externes sensibles utilisent des cles d'idempotence quand c'est pertinent.

## Module `billing` et Stripe

Le module `billing` suit la meme architecture que `projects`:

```txt
src/modules/billing/
  domain/
    billing.entity.ts
    billing.repository.ts
    payment-provider.ts
  application/
    dtos/
      billing.dto.ts
    use-cases/
      create-checkout-session.use-case.ts
      create-billing-portal-session.use-case.ts
      get-billing-profile.use-case.ts
  infrastructure/
    prisma-billing.repository.ts
    stripe.ts
    stripe-payment.provider.ts
    stripe-webhook.mapper.ts
  presentation/
    actions.ts
    queries.ts
  index.ts
```

### Pourquoi Stripe est dans `infrastructure`

Stripe est un fournisseur externe. Le domaine ne doit pas connaitre le SDK Stripe.

Le domaine expose un port:

```ts
export interface PaymentProvider {
  createCheckoutSession(...): Promise<CheckoutSessionResult>;
  createBillingPortalSession(...): Promise<BillingPortalResult>;
}
```

L'implementation Stripe vit dans:

```txt
src/modules/billing/infrastructure/stripe-payment.provider.ts
```

Cela permet de remplacer Stripe, de mocker le provider en test, ou d'ajouter un autre provider sans changer les use cases.

### Checkout

La Server Action:

```txt
src/modules/billing/presentation/actions.ts
```

appelle `createCheckoutSessionUseCase`, puis redirige vers l'URL Stripe.

Le Checkout utilise:

- `mode: "subscription"`;
- `client_reference_id` avec le workspace;
- `metadata.workspaceId`;
- une cle d'idempotence basee sur workspace et price.

### Billing Portal

Le Billing Portal permet a l'utilisateur de gerer son abonnement cote Stripe.

Le use case verifie d'abord que le workspace possede un `stripeCustomerId`, puis demande une session portal au provider.

### Webhook

Le endpoint Next.js est:

```txt
src/app/api/stripe/webhook/route.ts
```

Il fait quatre choses:

1. Lit le corps brut avec `request.text()`.
2. Verifie la signature `stripe-signature` avec `STRIPE_WEBHOOK_SECRET`.
3. Enregistre l'event dans `StripeEvent` pour l'idempotence.
4. Synchronise `Subscription` dans Prisma.

Events geres:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

### Variables d'environnement Stripe

```bash
NEXT_PUBLIC_APP_URL="http://localhost:3000"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRO_PRICE_ID="price_..."
```

### Test local des webhooks

Avec Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Le secret affiche par la CLI doit etre place dans `STRIPE_WEBHOOK_SECRET`.

## Alias TypeScript

`tsconfig.json` configure:

```json
"@/*": ["./src/*"]
```

Les imports applicatifs doivent donc utiliser:

```ts
import { prisma } from "@/infrastructure/database/prisma";
```

Cela evite les chemins relatifs fragiles comme `../../../../`.

## Ajouter un nouveau module

La commande recommandee est:

```bash
npm run make --module invoices
```

La commande est interactive: elle demande si tu veux creer des properties, puis te demande pour chaque property:

- son nom;
- son type;
- si elle est optionnelle.

Alias disponible pour creer explicitement une entite:

```bash
npm run make --entity invoices
```

Mode non interactif:

```bash
npm run make -- module invoices number:string total:number dueAt:Date paid:boolean
npm run make:module -- contacts firstName:string lastName:string email:string
npm run make -- module posts title:string author:ManyToOne:User tags:ManyToMany:Tag
npm run make -- module articles title:string status:enum:DRAFT,PUBLISHED,ARCHIVED
```

Options:

```bash
npm run make -- module billing --dry-run
npm run make -- module billing --force
```

La commande cree une structure compilable et n'ecrase pas les fichiers existants sans `--force`.

Si le module existe deja, la commande passe en mode mise a jour: elle relit les properties existantes dans `New<Entity>`, fusionne les nouvelles properties, puis regenere les fichiers du module.

Exemple:

```bash
npm run make --module invoices dueAt:Date=optional customer:ManyToOne:User
```

Dans cet exemple, les properties existantes de `Invoice` sont conservees et `dueAt` / `customerId` sont ajoutees.

Types de champs supportes:

- `string`
- `number`
- `boolean`
- `Date`
- `enum:VALUE_ONE,VALUE_TWO`
- `ManyToOne:Entity`
- `ManyToMany:Entity`

Pour un champ optionnel, utilise `=optional`, par exemple:

```bash
npm run make -- module posts title:string excerpt:string=optional published:boolean
npm run make -- module articles status:enum:DRAFT,PUBLISHED=optional
```

La syntaxe quotee `"excerpt:string?"` fonctionne aussi, mais `=optional` est plus fiable avec zsh.

Une enum genere:

- une constante `EntityFieldValues` dans l'entity;
- un type union TypeScript strict;
- une validation dans la Server Action via `readEnum`;
- une enum Prisma lors de `npm run make:prisma`.

Pour les relations, le generateur reste volontairement neutre cote Prisma:

- `author:ManyToOne:User` genere `authorId` et une reference optionnelle `author`.
- `tags:ManyToMany:Tag` genere `tagIds` et une reference optionnelle `tags`.

Le repository Prisma genere reste un stub a completer apres l'ajout du modele et des relations dans `prisma/schema.prisma`.

## Verifier les modules

La commande suivante parcourt `src/modules` et verifie les modules generes:

```bash
npm run check:modules
```

Elle controle notamment:

- les fichiers attendus d'un module genere;
- la presence de `Entity`, `NewEntity`, DTO, use cases, actions, queries;
- la coherence des champs scalaires;
- la coherence des enums et de leurs validations de formulaire;
- la coherence des relations `ManyToOne` et `ManyToMany`;
- les exports publics dans `index.ts`.

Les modules custom comme `projects` ou `billing` peuvent etre signales en warning et ignores pour les controles stricts. Pour forcer les controles stricts sur tous les modules:

```bash
npm run check:modules -- --strict-generated
```

Pour tester le generateur de bout en bout:

```bash
npm run test:generators
```

Cette commande cree des modules temporaires a nom unique, verifie scalaires, enums, ajout sur module existant, `ManyToOne`, `ManyToMany`, erreurs controlees et dry-run Prisma, puis supprime les modules temporaires.

## Generer Prisma

La commande suivante lit les entities generees dans `src/modules/*/domain/*.entity.ts` et propose les modeles Prisma manquants:

```bash
npm run make:prisma -- --dry-run
```

Pour appliquer:

```bash
npm run make:prisma
npx prisma format
npx prisma generate
```

La commande est volontairement prudente:

- elle ajoute uniquement les modeles absents;
- elle ne modifie pas les modeles Prisma existants;
- elle ignore les modules custom connus comme `billing` et `projects`;
- elle genere les champs scalaires simples;
- elle genere les enums manquantes;
- elle genere `ManyToOne` via `fieldId` + `@relation`;
- elle genere `ManyToMany` sous forme de relation Prisma implicite `Target[]`.

Les choix avances restent a ajuster manuellement dans `prisma/schema.prisma`: `@unique`, `@@index`, `onDelete`, `Decimal`, table pivot explicite, noms de relations inverses.

Ameliorations possibles pour aller plus loin:

- mettre a jour automatiquement les modeles Prisma existants quand une property est ajoutee apres coup;
- ajouter un type `Decimal` dedie aux montants;
- generer des schemas de validation par module;
- permettre une table pivot explicite pour les relations `ManyToMany` avec metadata;
- proposer une commande `make:page` pour generer une page CRUD minimale.

Pour ajouter une feature manuellement:

1. Creer `src/modules/billing`.
2. Ajouter `domain/` avec entites, regles et ports.
3. Ajouter `application/use-cases/`.
4. Ajouter les DTO si la feature retourne des donnees a l'UI.
5. Ajouter `infrastructure/` avec l'implementation concrete des ports.
6. Ajouter `presentation/actions.ts` et/ou `presentation/queries.ts`.
7. Exposer uniquement l'API publique depuis `index.ts`.
8. Consommer le module depuis `src/app`.

Structure:

```txt
src/modules/billing/
  domain/
    subscription.entity.ts
    billing.rules.ts
    billing.repository.ts
  application/
    dtos/
      subscription.dto.ts
    use-cases/
      change-plan.use-case.ts
      get-subscription.use-case.ts
  infrastructure/
    stripe-billing.repository.ts
  presentation/
    actions.ts
    queries.ts
  index.ts
```

## Convention de nommage

- Entites: `<name>.entity.ts`
- Regles metier: `<name>.rules.ts`
- Ports: `<name>.repository.ts`
- Implementations Prisma: `prisma-<name>.repository.ts`
- Use cases: `<verb>-<resource>.use-case.ts`
- DTO: `<name>.dto.ts`
- Server Actions: `actions.ts`
- Queries serveur: `queries.ts`

## Tests recommandes

Priorite de test:

1. `domain`: tests unitaires des regles metier.
2. `application`: tests des use cases avec repositories fake.
3. `infrastructure`: tests d'integration Prisma si la base de test est disponible.
4. `presentation`: tests plus rares, surtout pour validation de session, permissions et mapping `FormData`.

Un use case bien isole doit pouvoir etre teste sans Next.js.

## Ce qu'il faut eviter

- Importer Prisma dans `src/app`.
- Importer Next.js dans `domain` ou `application`.
- Mettre une regle de pricing ou de quota dans une Server Action.
- Retourner un objet Prisma brut a une page.
- Lire `process.env` depuis un module metier.
- Laisser une page dashboard appeler la DB pendant le build.
- Importer les fichiers internes d'un module depuis un autre module sans passer par une API claire.

## Checklist avant de forker pour un nouveau SaaS

- Changer `siteConfig`.
- Remplacer `requireAppSession()` par la vraie auth.
- Configurer `DATABASE_URL`.
- Configurer `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` et les `price_...`.
- Creer les migrations Prisma.
- Ajouter un seed pour `User`, `Workspace` et `Membership`.
- Supprimer ou adapter le module `projects` si ce n'est qu'un exemple.
- Ajouter les modules produit du SaaS.
- Lancer `npm run lint` et `npm run build`.
