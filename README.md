# todo-trpc

Todo List full-stack con **tRPC v11** + **Next.js (App Router)** + **Drizzle ORM** + **SQLite (libsql)** + **TanStack Query v5**.

## Stack

- **Next.js 16** (App Router, React Server Components + Server Actions)
- **tRPC v11**: api tipo-segura cliente↔server, batching por HTTP, `httpBatchLink`
- **Drizzle ORM + SQLite**: persistencia real en archivo (`todo.db`), cursor keyset en `list`
- **TanStack Query v5**: cache, `useInfiniteQuery` para paginación, estados de mutación
- **Prerender + SSR**: `createHydrationHelpers` prefetchea la primera página en el server y la serializa con `dehydrate` → la app no muestra "Cargando..." al abrir

## Scripts

```bash
npm run dev      # desarrollo
npm run build    # build de producción
npm run start    # servir el build
npm run lint     # eslint
```

## Cómo funciona (resumen)

- Rutas API: `app/api/trpc/[trpc]/route.ts`
- Router: `server/routers/` (CRUD de todos, paginación por cursor, actualización parcial)
- Context + middleware: `server/trpc.ts` (`timing`, `isAuthed` — auth simulada por header `x-user-id`)
- Capa cliente: `utils/trpc.ts`, `utils/providers.tsx`, `utils/ssr.ts` (prefetch + hydration)
- DB: `server/db/` (schema, cliente libsql), migraciones con `drizzle-kit`

Para crear/actualizar el schema de la DB:

```bash
npx drizzle-kit push
```

## Notas

- La autenticación es **simulada**: el usuario se identifica con el header `x-user-id` (`demo-user`). Es el gancho para conectar una cookie/JWT real más adelante.
- La DB se crea como `todo.db` en la raíz del proyecto (ignorada por git).