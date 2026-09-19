# Connect from any application - Neon Docs

> Source: https://neon.tech/docs/connect/connect-from-any-app
> Cached: 2026-09-18T16:31:27.717Z

---

# Connect from any application

Learn how to connect to Neon from any application

Copy page### What you will learn:

Where to find database connections details

Where to find example connection snippets

Protocols supported by Neon

### Related topics

- [Choosing a driver and connection type](/docs/connect/choose-connection)
- [Neon VS Code Extension](/docs/local/vscode-extension)
- [Connect to Neon securely](/docs/connect/connect-securely)
- [Connection pooling](/docs/connect/connection-pooling)
- [Connect with psql](/docs/connect/query-with-psql-editor)

You can connect to your Neon database from any application. The standard method is to copy your [connection string](#get-a-connection-string-from-the-neon-console) from the Neon console and use it in your app or client. For a streamlined development experience, you can also use the [Neon VS Code extension](#connect-with-the-neon-vs-code-extension) to manage connections, browse schemas, and run queries directly in your editor.

#### important

You are responsible for maintaining the records and associations of any connection strings in your environment and systems.

## Get a connection string from the Neon console[](#get-a-connection-string-from-the-neon-console)

When connecting to Neon from an application or client, you connect to a database in your Neon project. In Neon, a database belongs to a branch, which may be the default branch of your project (`main`) or a child branch.

You can find the connection details for your database by clicking the **Connect** button in the Console nav. This opens the **Connect to your branch** modal. Select a branch, a compute, a database, and a role. A connection string is constructed for you.

Neon supports both pooled and direct connections to your database. Neon&#x27;s connection pooler supports a higher number of concurrent connections, so we provide pooled connection details in the **Connect to your branch** modal by default, which adds a `-pooler` option to your connection string. If needed, you can get direct database connection details from the modal disabling the **Connection pooling** toggle. For more information about pooled connections, see [Connection pooling](/docs/connect/connection-pooling#connection-pooling).

A Neon connection string includes the role, password, hostname, and database name.

```
postgresql://alex:AbC123dEf@ep-cool-darkness-a1b2c3d4-pooler.us-east-2.aws.neon.tech/dbname?sslmode=require&channel_binding=require
             ^    ^         ^                         ^                              ^
       role -|    |         |- hostname               |- pooler option               |- database
                  |
                  |- password
```

#### note

The hostname includes the ID of the compute, which has an `ep-` prefix: `ep-cool-darkness-123456`. For more information about Neon connection strings, see [connection string](/docs/reference/glossary#connection-string).

You can use the details from the **Connect to your branch** modal to configure your database connection. For example, you might place the connection details in an `.env` file, assign the connection string to a variable, or pass the connection string on the command-line.

**.env file**

```
PGHOST=ep-cool-darkness-a1b2c3d4-pooler.us-east-2.aws.neon.tech
PGDATABASE=dbname
PGUSER=alex
PGPASSWORD=AbC123dEf
PGPORT=5432
```

**Variable (`DATABASE_URL`)**

Most frameworks read the connection string from a `DATABASE_URL` environment variable. The connection string you copy from the **Connect** modal *is* your `DATABASE_URL`. Assign it as-is:

```
DATABASE_URL="postgresql://alex:AbC123dEf@ep-cool-darkness-a1b2c3d4-pooler.us-east-2.aws.neon.tech/dbname?sslmode=require&channel_binding=require"
```

**Command-line**

```
psql postgresql://alex:AbC123dEf@ep-cool-darkness-a1b2c3d4-pooler.us-east-2.aws.neon.tech/dbname?sslmode=require&channel_binding=require
```

#### note

Neon requires that all connections use SSL/TLS encryption, but you can increase the level of protection by configuring the `sslmode` option. For more information, see [Connect to Neon securely](/docs/connect/connect-securely).

### Get a connection string from the CLI[](#get-a-connection-string-from-the-cli)

If you prefer the terminal, the Neon CLI returns the same connection string with the [`neon connection-string`](/docs/cli/connection-string) command:

```
neon connection-string
```

Pass a branch name as a positional argument, and use `--database-name`, `--role-name`, or `--pooled` to control the output. This is handy when you want to assign the result to an environment variable such as `DATABASE_URL` in a script.

## Connect with the Neon VS Code extension[](#connect-with-the-neon-vs-code-extension)

The [Neon VS Code extension](/docs/local/vscode-extension) lets you connect to any Neon branch and manage your database directly in your IDE. Available for VS Code, Cursor, and other VS Code-compatible editors, this extension lets you:

- Connect to any Neon project and branch with automatic detection of connection strings in your workspace

- Copy connection strings directly to your `.env` file

- Browse database schemas, run SQL queries, and edit table data

- Create and manage branches directly from your editor

- Enable AI-powered database features with automatic MCP Server configuration

The extension provides a streamlined workflow for working with Neon during development without leaving your editor.

## Where can I find my password?[](#where-can-i-find-my-password)

It&#x27;s included in your Neon connection string. Click the **Connect** button in the Console nav to open the **Connect to your branch** modal.

### Save your connection details to 1Password[](#save-your-connection-details-to-1password)

If you have a [1Password](https://1password.com/) browser extension, you can save your database connection details to 1Password directly from the Neon Console. Click **Connect** in the Console nav, then click **Save in 1Password**.

## What port does Neon use?[](#what-port-does-neon-use)

Neon uses the default Postgres port, `5432`.

## How do I connect my application using the connection string?[](#how-do-i-connect-my-application-using-the-connection-string)

Save the connection string as an environment variable (commonly `DATABASE_URL`), then read it from your code and pass it to a Postgres driver. Neon speaks the standard Postgres wire protocol, so any Postgres client works: `pg`, `psycopg2`, `psql`, Prisma, Drizzle, SQLAlchemy, and others.

Node.js (pg)Node.js (neon)Python (psycopg2)psql```
import { Pool } from &#x27;pg&#x27;;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const { rows } = await pool.query(&#x27;SELECT * FROM users WHERE id = $1&#x27;, [1]);
```

Read the string from the environment rather than hardcoding it in source, which is a common source of credential leaks. For Prisma, Drizzle, SQLAlchemy, and other ORMs, see the [frameworks](/docs/get-started/frameworks) and [languages](/docs/get-started/languages) guides.

### Connection examples in the Console[](#connection-examples-in-the-console)

The **Connect to your branch** modal provides connection examples for different frameworks and languages, constructed for the branch, database, and role that you select.

## Network protocol support[](#network-protocol-support)

Neon projects provisioned on AWS support both [IPv4](https://en.wikipedia.org/wiki/Internet_Protocol_version_4) and [IPv6](https://en.wikipedia.org/wiki/IPv6) addresses. Neon projects provisioned on Azure support IPv4.

Additionally, Neon provides a low-latency serverless driver that supports connections over WebSockets and HTTP. Great for serverless or edge environments where connections over TCP may not be not supported. For further information, refer to our [Neon serverless driver](/docs/serverless/serverless-driver) documentation.

## Connection notes[](#connection-notes)

- Some older Postgres client libraries and drivers, including older `psql` executables, are built without [Server Name Indication (SNI)](/docs/reference/glossary#sni) support, which means that a connection workaround may be required. For more information, see [Connection errors: The endpoint ID is not specified](/docs/connect/connection-errors#the-endpoint-id-is-not-specified).

- Some Java-based tools that use the pgJDBC driver for connecting to Postgres, such as DBeaver, DataGrip, and CLion, do not support including a role name and password in a database connection string or URL field. When you find that a connection string is not accepted, try entering the database name, role, and password values in the appropriate fields in the tool&#x27;s connection UI when configuring a connection to Neon. For examples, see [Connect a GUI or IDE](/docs/connect/connect-postgres-gui#connect-to-the-database).

- When connecting from BI tools like Metabase, Tableau, or Power BI, we recommend using a **read replica** instead of your main database compute. BI tools often run long or resource-intensive queries, which can impact performance on your primary branch. Read replicas can scale independently and handle these workloads without affecting your main production traffic. To learn more, see [Neon read replicas](/docs/introduction/read-replicas).

## Need help?[](#need-help)

Join our [Discord Server](https://neon.com/discord) to ask questions or see what others are doing with Neon. For paid plan support options, see [Support](/docs/introduction/support).