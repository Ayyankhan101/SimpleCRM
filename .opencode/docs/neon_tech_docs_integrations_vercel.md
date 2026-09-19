# Connect a Next.js application to Neon - Neon Docs

> Source: https://neon.tech/docs/integrations/vercel
> Cached: 2026-09-18T16:31:21.839Z

---

# Connect a Next.js application to Neon

Set up a Neon project in seconds and connect from a Next.js application

Copy pagePre-built prompt for connecting Next.js applications to NeonCopy prompt
Next.js by Vercel is an open-source web development framework that enables React-based web applications. This topic describes how to create a Neon project and access it from a Next.js application.

## Video walkthrough[](#video-walkthrough)

Watch **Getting started with Neon** for an end-to-end setup with Next.js and Drizzle.

To create a Neon project and access it from a Next.js application:

## Create a Neon project[](#create-a-neon-project)

If you do not have one already, create a Neon project. Save your connection details including your password. They are required when defining connection settings.

- Navigate to the [Projects](https://console.neon.tech/app/projects) page in the Neon Console.

- Click **New Project**.

- Specify your project settings and click **Create Project**.

## Create a Next.js project and add dependencies[](#create-a-nextjs-project-and-add-dependencies)

Create a Next.js project if you do not have one. For instructions, see [Create a Next.js App](https://nextjs.org/docs/app/getting-started/installation), in the Vercel documentation.

Add project dependencies using one of the following commands. If you&#x27;re not sure which to use, use `@neondatabase/serverless`: it connects over HTTP instead of TCP, which works in Next.js Edge Functions and other environments without TCP support, and needs no extra SSL configuration.

Neon serverless driver (Recommended)postgres.jsnode-postgres```
npm install @neondatabase/serverless
```

## Store your Neon credentials[](#store-your-neon-credentials)

Add a `.env.local` file to your project directory and add your Neon connection string to it. You can find your Neon database connection string by clicking the **Connect** button in the Console nav to open the **Connect to your branch** modal. For more information, see [Connect from any application](/docs/connect/connect-from-any-app).

```
DATABASE_URL="postgresql://<user>:<password>@<endpoint_hostname>.neon.tech:<port>/<dbname>?sslmode=require&channel_binding=require"
```

## Configure the Postgres client[](#configure-the-postgres-client)

There are multiple ways to make server side requests with Next.js. See below for the different implementations.

### App Router[](#app-router)

There are two methods for fetching and mutating data using server-side requests in Next.js App Router, they are:

- `Server Components` fetches data at runtime on the server.

- `Server Actions` functions executed on the server to perform data mutations.

#### Server Components[](#server-components)

In your server components using the App Router, add the following code snippet to connect to your Neon database:

Neon serverless driver (Recommended)postgres.jsnode-postgres```
import { neon } from &#x27;@neondatabase/serverless&#x27;;

async function getData() {
  const sql = neon(process.env.DATABASE_URL);
  const response = await sql`SELECT version()`;
  return response[0].version;
}

export default async function Page() {
  const data = await getData();
  return <>{data}</>;
}
```

#### Understanding Caching in Server Components[](#understanding-caching-in-server-components)

The examples above will work in development, but in production builds, Next.js will statically render these pages at build time. This means the database query runs once during build, not on every request.

If you need fresh data on each request, add this to your page:

`export const dynamic = &#x27;force-dynamic&#x27;;`For other scenarios like periodic updates, see [Time-based Revalidation](https://nextjs.org/docs/app/building-your-application/caching#time-based-revalidation) in the Next.js docs.

#### Server Actions[](#server-actions)

In your server actions using the App Router, add the following code snippet to connect to your Neon database:

Neon serverless driver (Recommended)postgres.jsnode-postgres```
import { neon } from &#x27;@neondatabase/serverless&#x27;;

export default async function Page() {
  async function create(formData: FormData) {
    "use server";
    const sql = neon(process.env.DATABASE_URL);
    await sql`CREATE TABLE IF NOT EXISTS comments (comment TEXT)`;
    const comment = formData.get("comment");
    await sql`INSERT INTO comments (comment) VALUES (${comment})`;
  }
  return (
    <form action={create}>
      <input type="text" placeholder="write a comment" name="comment" />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Pages Router[](#pages-router)

There are two methods for fetching data using server-side requests in Next.js Pages Router, they are:

- `getServerSideProps` fetches data at runtime so that content is always fresh.

- `getStaticProps` pre-renders pages at build time for data that is static or changes infrequently.

#### getServerSideProps[](#getserversideprops)

From `getServerSideProps` using the Pages Router, add the following code snippet to connect to your Neon database:

Neon serverless driver (Recommended)postgres.jsnode-postgres```
import { neon } from &#x27;@neondatabase/serverless&#x27;;

export async function getServerSideProps() {
  const sql = neon(process.env.DATABASE_URL);
  const response = await sql`SELECT version()`;
  return { props: { data: response[0].version } };
}

export default function Page({ data }) {
  return <>{data}</>;
}
```

#### getStaticProps[](#getstaticprops)

From `getStaticProps` using the Pages Router, add the following code snippet to connect to your Neon database:

Neon serverless driver (Recommended)postgres.jsnode-postgres```
import { neon } from &#x27;@neondatabase/serverless&#x27;;

export async function getStaticProps() {
  const sql = neon(process.env.DATABASE_URL);
  const response = await sql`SELECT version()`;
  return { props: { data: response[0].version } };
}

export default function Page({ data }) {
  return <>{data}</>;
}
```

### Serverless Functions[](#serverless-functions)

From your Serverless Functions, add the following code snippet to connect to your Neon database:

Neon serverless driver (Recommended)postgres.jsnode-postgres```
import { neon } from &#x27;@neondatabase/serverless&#x27;;

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  const response = await sql`SELECT version()`;
  const { version } = response[0];
  res.status(200).json({ version });
}
```

### Edge Functions[](#edge-functions)

From your Edge Functions, add the following code snippet and connect to your Neon database using the [Neon serverless driver](/docs/serverless/serverless-driver):

```
export const config = {
  runtime: &#x27;edge&#x27;,
};

import { neon } from &#x27;@neondatabase/serverless&#x27;;

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req: Request) {
  const response = await sql`SELECT version()`;
  const { version } = response[0];
  return Response.json({ version });
}
```

## Run the app[](#run-the-app)

When you run `npm run dev` you can expect to see the following on `localhost:3000`:

```
PostgreSQL 17.7 on aarch64-unknown-linux-gnu, compiled by gcc (Debian 12.2.0-14+deb12u1) 12.2.0, 64-bit
```

## Connection issues[](#connection-issues)

- If you see an `endpoint ID is not specified` error, the TLS client your Postgres driver depends on doesn&#x27;t support Server Name Indication (SNI), which Neon uses to route connections. For `pg` (node-postgres), this means an outdated `libpq`-compatible TLS stack; upgrading `pg` usually resolves it.

- If you encounter an `SSL SYSCALL error: EOF detected` (or a similar connection-reset error), this typically happens when an application tries to reuse a connection after the Neon compute has been suspended due to inactivity. This mainly affects the `pg` and `postgres.js` examples above when used outside a serverless request lifecycle, since they can hold a connection open; reconnecting on error resolves it. `@neondatabase/serverless` isn&#x27;t affected, since it opens a new HTTP connection per query.

### Where to upload and serve files?[](#where-to-upload-and-serve-files)

Neon does not provide a built-in file storage service. For managing binary file data (blobs), we recommend using dedicated, specialized storage services. Follow our guide on [File Storage](/docs/guides/file-storage) to learn more about how to store files in external object storage and file management services and track metadata in Neon.

## Next steps[](#next-steps)

- [Set up Managed Better Auth](/docs/auth/quick-start/nextjs-api-only): Add managed authentication that branches with your database

- [Add Object Storage](/docs/storage/overview): S3-compatible file storage that branches with your database

- [Deploy a Function](/docs/compute/functions/overview): Run backend compute next to your database, no separate hosting needed

- [Call an LLM with AI Gateway](/docs/ai-gateway/overview): Access foundation models from Anthropic, OpenAI, Google, and more with one credential

## Need help?[](#need-help)

Join our [Discord Server](https://neon.com/discord) to ask questions or see what others are doing with Neon. For paid plan support options, see [Support](/docs/introduction/support).