# Neon CLI command: projects - Neon Docs

> Source: https://neon.tech/docs/reference/cli-projects
> Cached: 2026-09-18T17:22:47.173Z

---

# Neon CLI command: projects

List, create, update, delete, recover, and get Neon projects

Copy pageThe `projects` command lists, creates, updates, deletes, recovers, and retrieves Neon projects from the terminal. For information about projects in Neon, see [Projects](/docs/manage/projects). Subcommands that show no options table accept only the [global options](/docs/cli#global-options). If `--project-id` is omitted, the CLI resolves it from your [context file](/docs/cli/link), auto-selects when your account has only one project, and otherwise asks you to pass `--project-id`.

Subcommands: [create](#create), [delete](#delete), [get](#get), [list](#list), [recover](#recover), [update](#update)

## neon projects list[](#list)

Lists projects that belong to your Neon account, as well as any projects that were shared with you.

```
neon projects list [options]
```

OptionDescriptionTypeDefaultRequired`--org-id`List projects of a given organizationstring—No`--recoverable-only`List only deleted projects within their deletion grace periodboolean—No

List projects in your [default organization](/docs/reference/glossary#default-organization). If no organization context is set, the CLI prompts you to select one.

```
neon projects list
```

```
Projects
┌────────────────────────┬────────────────────┬───────────────┬──────────────────────┐
│ Id                     │ Name               │ Region Id     │ Created At           │
├────────────────────────┼────────────────────┼───────────────┼──────────────────────┤
│ crimson-voice-12345678 │ frontend           │ aws-us-east-2 │ 2024-04-15T11:17:30Z │
├────────────────────────┼────────────────────┼───────────────┼──────────────────────┤
│ calm-thunder-12121212  │ backend            │ aws-us-east-2 │ 2024-04-10T15:21:01Z │
├────────────────────────┼────────────────────┼───────────────┼──────────────────────┤
│ nameless-hall-87654321 │ billing            │ aws-us-east-2 │ 2024-04-10T14:35:17Z │
└────────────────────────┴────────────────────┴───────────────┴──────────────────────┘
Shared with you
┌───────────────────┬────────────────────┬──────────────────┬──────────────────────┐
│ Id                │ Name               │ Region Id        │ Created At           │
├───────────────────┼────────────────────┼──────────────────┼──────────────────────┤
│ noisy-fire-212121 │ API                │ aws-eu-central-1 │ 2023-04-22T18:41:13Z │
└───────────────────┴────────────────────┴──────────────────┴──────────────────────┘
```

List all projects belonging to a specific organization:

```
neon projects list --org-id org-xxxx-xxxx
```

List projects that can be recovered (deleted within the last 7 days):

```
neon projects list --recoverable-only
```

Output```
Projects
┌─────────────────────┬───────────┬───────────────┬──────────────────────┬──────────────────────┬──────────────────────┐
│ Id                  │ Name      │ Region Id     │ Created At           │ Deleted At           │ Recoverable Until    │
├─────────────────────┼───────────┼───────────────┼──────────────────────┼──────────────────────┼──────────────────────┤
│ crimson-voice-12345 │ myproject │ aws-us-east-2 │ 2024-04-15T11:17:30Z │ 2024-04-16T14:22:15Z │ 2024-04-23T14:22:15Z │
└─────────────────────┴───────────┴───────────────┴──────────────────────┴──────────────────────┴──────────────────────┘
```

## neon projects create[](#create)

Creates a Neon project.

```
neon projects create [options]
```

OptionDescriptionTypeDefaultRequired`--block-public-connections`When set, connections from the public internet are disallowed. This supersedes the AllowedIPs list. This parameter is under active development and its semantics may change in the future.boolean—No`--block-vpc-connections`When set, connections using VPC endpoints are disallowed. This parameter is under active development and its semantics may change in the future.boolean—No`--cu`The number of Compute Units. Could be a fixed size (e.g. "2") or a range delimited by a dash (e.g. "0.5-3").string—No`--database`The database name. If not specified, the default database name, `neondb`, will be used.stringneondbNo`--hipaa`Enable HIPAA compliance for the project.boolean—No`--name`The project name. If not specified, the name will be identical to the generated project IDstringproject IDNo`--org-id`The project&#x27;s organization IDstring—No`--pg-version`Major PostgreSQL version (14–19). Version 19 is available only in regions where it has been enabled.number—No`--psql`Connect to a new project via psqlboolean`false`No`--region-id`The region ID. Possible values: aws-us-west-2, aws-ap-southeast-1, aws-ap-southeast-2, aws-eu-central-1, aws-us-east-2, aws-us-east-1, azure-eastus2string—No`--role`The role name. If not specified, the default role name, `{database_name}_owner`, will be used.string{database}_ownerNo`--secrets`Include connection credentials in command output. Use --no-secrets to omit themboolean`true`No`--set-context`Set the current context to the new projectboolean`false`No
The `--region-id` value defaults to `aws-us-east-2` if not specified. `--block-public-connections` and `--block-vpc-connections` are part of [Private Networking](/docs/guides/neon-private-networking); `--hipaa` enables [HIPAA compliance](/docs/security/hipaa) for the project.

#### note

Neon projects created using the CLI use the default Postgres version, which is Postgres 18. To create a project with a different Postgres version, pass `--pg-version`:

`neon projects create --name mynewproject --pg-version 17`You can also enable logical replication for an existing project with `neon projects update <project-id> --enable-logical-replication` (add `--yes` to skip the confirmation prompt), and create protected branches with `neon branches create --protected`.

Create a project with a user-defined name in a specific region:

```
neon projects create --name mynewproject --region-id aws-us-west-2
```

Output```
┌───────────────────┬──────────────┬───────────────┬──────────────────────┐
│ Id                │ Name         │ Region Id     │ Created At           │
├───────────────────┼──────────────┼───────────────┼──────────────────────┤
│ muddy-wood-859533 │ mynewproject │ aws-us-west-2 │ 2023-07-09T17:04:29Z │
└───────────────────┴──────────────┴───────────────┴──────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────┐
│ Connection Uri                                                                       │
├──────────────────────────────────────────────────────────────────────────────────────┤
│ postgresql://[user]:[password]@[neon_hostname]/[dbname]                              │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

#### tip

The Neon CLI provides a `neon connection-string` command you can use to extract a connection URI programmatically. See [the connection-string command](/docs/cli/connection-string).

Create a project with a specific Postgres major version:

```
neon projects create --name mynewproject --pg-version 17
```

Omit the connection string from the output, keeping it out of terminal scrollback and CI logs:

```
neon projects create --name mynewproject --no-secrets
```

Needs Neon CLI 4.9.0+; older versions ignore `--no-secrets` and still print the connection string.

Create a project with `--output json`, which returns the full project response data and is the recommended format for scripts and agents. The output below was captured on an earlier CLI version; new projects report `"pg_version": 18`.

```
neon projects create --output json
```

Show output```
{
  "project": {
    "data_storage_bytes_hour": 0,
    "data_transfer_bytes": 0,
    "written_data_bytes": 0,
    "compute_time_seconds": 0,
    "active_time_seconds": 0,
    "cpu_used_sec": 0,
    "id": "long-wind-77910944",
    "platform_id": "aws",
    "region_id": "aws-us-east-2",
    "name": "long-wind-77910944",
    "provisioner": "k8s-pod",
    "default_endpoint_settings": {
      "autoscaling_limit_min_cu": 1,
      "autoscaling_limit_max_cu": 1,
      "suspend_timeout_seconds": 0
    },
    "pg_version": 17,
    "proxy_host": "us-east-2.aws.neon.tech",
    "branch_logical_size_limit": 204800,
    "branch_logical_size_limit_bytes": 214748364800,
    "store_passwords": true,
    "creation_source": "neon",
    "history_retention_seconds": 604800,
    "created_at": "2023-08-04T16:16:45Z",
    "updated_at": "2023-08-04T16:16:45Z",
    "consumption_period_start": "0001-01-01T00:00:00Z",
    "consumption_period_end": "0001-01-01T00:00:00Z",
    "owner_id": "e56ad68e-7f2f-4d74-928c-9ea25d7e9864"
  },
  "connection_uris": [
    {
      "connection_uri": "postgresql://alex:AbC123dEf@ep-cool-darkness-123456.us-east-2.aws.neon.tech/dbname?sslmode=require&channel_binding=require",
      "connection_parameters": {
        "database": "dbname",
        "password": "AbC123dEf",
        "role": "alex",
        "host": "ep-cool-darkness-123456.us-east-2.aws.neon.tech",
        "pooler_host": "ep-cool-darkness-123456-pooler.us-east-2.aws.neon.tech"
      }
    }
  ]
}
```

Create a project and connect to it with `psql` immediately. Arguments after `--` are passed through to psql, so you can run an `.sql` file or a query on creation:

```
neon projects create --psql
neon projects create --psql -- -f dump.sql
neon projects create --psql -- -c "SELECT version()"
```

Create a project and set the Neon CLI project context to it:

```
neon projects create --set-context
```

## neon projects update[](#update)

Updates a Neon project. The `<id>` is the project ID, which you can obtain by listing your projects or from the **Settings** page in the Neon Console.

```
neon projects update <id> [options]
```

OptionDescriptionTypeDefaultRequired`--block-public-connections`When set, connections from the public internet are disallowed. This supersedes the AllowedIPs list. This parameter is under active development and its semantics may change in the future. Use --block-public-connections=false to set the value to false.boolean—No`--block-vpc-connections`When set, connections using VPC endpoints are disallowed. This parameter is under active development and its semantics may change in the future. Use --block-vpc-connections=false to set the value to false.boolean—No`--cu`The number of Compute Units. Could be a fixed size (e.g. "2") or a range delimited by a dash (e.g. "0.5-3").string—No`--enable-logical-replication`Enable logical replication for all project endpoints. This suspends active endpoints and cannot be disabled.boolean—No`--hipaa`Enable HIPAA compliance for the project.boolean—No`--name`The project namestring—No`--yes`Skip the confirmation prompt when enabling logical replication.boolean`false`No
`--block-public-connections`, `--block-vpc-connections`, and `--hipaa` behave as described under [projects create](#create).

Update the project name:

```
neon projects update muddy-wood-859533 --name dev_project_1
```

Output```
┌───────────────────┬───────────────┬───────────────┬──────────────────────┐
│ Id                │ Name          │ Region Id     │ Created At           │
├───────────────────┼───────────────┼───────────────┼──────────────────────┤
│ muddy-wood-859533 │ dev_project_1 │ aws-us-west-2 │ 2023-07-09T17:04:29Z │
└───────────────────┴───────────────┴───────────────┴──────────────────────┘
```

Block connections from the public internet (see [restrict public internet access](/docs/guides/neon-private-networking#restrict-public-internet-access)):

```
neon projects update orange-credit-12345678 --block-public-connections=true
```

Enable [logical replication](/docs/guides/logical-replication-neon) for the project. This suspends active endpoints and cannot be disabled, so `--yes` skips the confirmation prompt:

```
neon projects update orange-credit-12345678 --enable-logical-replication --yes
```

## neon projects delete[](#delete)

Deletes a Neon project. The `<id>` is the project ID.

```
neon projects delete <id> [options]
```

```
neon projects delete muddy-wood-859533
```

Output```
┌───────────────────┬───────────────┬───────────────┬──────────────────────┐
│ Id                │ Name          │ Region Id     │ Created At           │
├───────────────────┼───────────────┼───────────────┼──────────────────────┤
│ muddy-wood-859533 │ dev_project_1 │ aws-us-west-2 │ 2023-07-09T17:04:29Z │
└───────────────────┴───────────────┴───────────────┴──────────────────────┘
```

Verify the deletion with `neon projects list`.

## neon projects recover[](#recover)

Recovers a deleted project within the deletion recovery period. The `<id>` is the project ID, which you can obtain by listing recoverable projects with `neon projects list --recoverable-only`.

```
neon projects recover <id> [options]
```

```
neon projects recover crimson-voice-12345678
```

Output```
┌────────────────────────┬───────────┬───────────────┬──────────────────────┐
│ Id                     │ Name      │ Region Id     │ Created At           │
├────────────────────────┼───────────┼───────────────┼──────────────────────┤
│ crimson-voice-12345678 │ myproject │ aws-us-east-2 │ 2024-04-15T11:17:30Z │
└────────────────────────┴───────────┴───────────────┴──────────────────────┘
```

For details on what&#x27;s recovered and what requires reconfiguration after recovery, see [Recover a deleted project](/docs/manage/projects#recover-a-deleted-project).

## neon projects get[](#get)

Retrieves details about a Neon project. The `<id>` is the project ID.

```
neon projects get <id> [options]
```

```
neon projects get muddy-wood-859533
```

Output```
┌───────────────────┬───────────────┬───────────────┬──────────────────────┐
│ Id                │ Name          │ Region Id     │ Created At           │
├───────────────────┼───────────────┼───────────────┼──────────────────────┤
│ muddy-wood-859533 │ dev_project_1 │ aws-us-west-2 │ 2023-07-09T17:04:29Z │
└───────────────────┴───────────────┴───────────────┴──────────────────────┘
```