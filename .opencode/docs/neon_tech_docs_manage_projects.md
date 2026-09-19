# Manage projects - Neon Docs

> Source: https://neon.tech/docs/manage/projects#create-a-project
> Cached: 2026-09-18T17:22:46.726Z

---

# Manage projects

Learn how to manage Neon projects from the Neon Console or the Neon API.

Copy pageIn Neon, the project is your main workspace. Within a project, you create branches for different workflows, like environments, features, or previews. Each branch contains its own databases, roles, computes, and replicas. Your [Neon Plan](/docs/introduction/plans) determines how many projects you can create and the resource limits within those projects.

## Default resources[](#default-resources)

When you add a new project, Neon creates the following resources by default:

- A root branch is created as your project&#x27;s default branch. In the Console, this branch is named `production`; via API/CLI, it&#x27;s named `main`. You can create child branches for development, testing, staging, and other purposes. For more information, see [Manage branches](/docs/manage/branches).

- A single primary read-write compute. This is the compute associated with the branch. For more information, see [Manage computes](/docs/manage/computes).

- A Postgres database that resides on the project&#x27;s default branch. If you did not specify your own database name when creating the project, the database created is named `neondb`.

- A Postgres role that is named for your database. For example, if your database is named `neondb`, the project is created with a default role named `neondb_owner`.

- Storage depends on your [Neon plan](/docs/introduction/plans). **On paid plans (Launch and Scale), there&#x27;s no hard per-branch size limit**; your storage grows with your usage, and you pay only for the storage you use. The Free plan includes 0.5 GB per project, shared across all branches.

## Create a project[](#create-a-project)

The following instructions describe how to create additional Neon projects. If you are creating your very first Neon project, refer to the instructions in [Playing with Neon](/docs/get-started/signing-up).

You can create a project from the Console or the Neon CLI. To create one with the API, see [Create a project with the API](#create-a-project-with-the-api).

ConsoleCLI

- Navigate to the [Neon Console](https://console.neon.tech).

- Click **New Project**.

- Enter a **Project name** and choose a **Region** (the cloud provider is part of the region). Project names are limited to 64 characters.

- Under **Services**, choose what to enable. **Postgres database** is on by default (expand it to set the **Postgres version**). Where the selected region supports them, you can also enable **Object storage**, **Functions**, **AI gateway**, and **Neon Auth**. Services that aren&#x27;t available in the selected region aren&#x27;t shown.

- Click **Create project**.

After creating a project, you are directed to the **Project Dashboard**.

## View projects[](#view-projects)

To view your projects:

- Navigate to the [Neon Console](https://console.neon.tech).

- From the profile menu in the top-right of the console, select your organization.

- The **Projects** page lists your projects, including any projects that have been shared with you.

## Project settings[](#project-settings)

Once you open a project, you use the **Settings** page to manage the project and configure its defaults. Settings are grouped into tabs, and project-wide settings are labeled **Applies to all branches** to distinguish them from branch-level settings.

The **Settings** page includes these tabs:

- **General**: View the project and branch IDs, rename the project or branch, protect a branch, set branch expiration, change the project&#x27;s default branch, and transfer or delete the project.

- **Postgres**: Configure project-wide database defaults (all labeled **Applies to all branches**): compute defaults (size and scale to zero) for new computes, the history window for [instant restore](/docs/introduction/branch-restore) and [Time Travel](/docs/guides/time-travel-assist), your [update schedule](/docs/manage/updates), [logical replication](/docs/guides/logical-replication-guide), and the [Data API](/docs/data-api/overview).

- **Networking**: Control **Public internet access** (allow any IP address or restrict to an [IP allowlist](/docs/introduction/ip-allow)) and **VPC access** ([Private Networking](/docs/guides/neon-private-networking)).

- **Credentials**: Manage branch-scoped, per-service credentials, used as S3 access keys for [Object Storage](/docs/storage/overview) and as Bearer API tokens for the [AI Gateway](/docs/ai-gateway/overview).

- **Auth**: Configure [Neon Auth](/docs/auth/overview): application info and URLs, trusted redirect domains, email sign-up and sign-in, OAuth providers, the email provider, and webhooks.

- **Functions**: Manage [custom domains](/docs/compute/functions/custom-domains) for your [Neon Functions](/docs/compute/functions/overview).

- **HIPAA compliance**: Enable [HIPAA compliance](/docs/security/hipaa) for the project.

- **Sharing** and **Project permissions**: Invite external collaborators and grant organization members per-project access. See [User permissions](/docs/manage/user-permissions).

### General project settings[](#general-project-settings)

On the **General** page, you are permitted to change the name of your project or copy the project ID. The project ID is permanent and cannot be changed.

### Change your project&#x27;s default compute settings[](#change-your-projects-default-compute-settings)

You can change your project&#x27;s default compute settings on the **Postgres** tab, under **Compute defaults**. These settings determine the compute resources allocated to any new branches or read replicas you create.

#### important

Changes to default compute settings only affect **newly created computes**. Existing computes, including those on your primary branch and read replicas, will not be automatically updated. To change settings for existing computes, you need to update them individually through the **Branches** page.

A Compute Unit (CU) represents approximately 4 GB of RAM, along with associated CPU and local SSD resources. New branches inherit compute settings from your first branch, but you can change these defaults to:

- Set smaller compute sizes for preview deployments and development branches

- Standardize settings across read replicas

- Optimize resource usage and costs for non-production workloads

Neon supports two compute configurations:

- **Fixed size:** Select a fixed compute size ranging from .25 CUs to 56 CUs

- **Autoscaling:** Specify minimum and maximum compute sizes (from .25 CU to 16 CUs) to automatically scale based on workload. Note: The maximum permitted autoscaling range is 8 CU, meaning the difference between max and min cannot exceed 8 CU (for example, if min = 1 CU, max can be at most 9 CU). For more information, see [Autoscaling](/docs/introduction/autoscaling)

### Configure the history window for instant restore[](#configure-the-history-window-for-instant-restore)

By default, Neon retains a history of changes for all branches in your project, enabling features like:

- [Instant restore](/docs/introduction/branch-restore) for recovering lost data

- [Time Travel](/docs/guides/time-travel-assist) queries for investigating data issues

For plan limits, billing, and how retention works, see [History window](/docs/introduction/history-window).

If you extend the history window, you expand how far back **instant restore** and Time Travel can go, but you also increase **History** usage (change history billed for instant restore) on your project.

Also note that adjusting the history window affects *all* branches in your project.

To configure the history window:

- Select a project in the Neon Console.

- On your **Project Dashboard**, select **Settings**.

- Select **Postgres**.

- Under **History window**, use the slider to choose how long to keep change history.

- Click **Save**.

### Schedule updates for your project[](#schedule-updates-for-your-project)

To keep your Neon computes and Postgres instances up to date, Neon automatically applies scheduled updates that include Postgres minor version upgrades, security patches, and new features. Updates are applied to the computes within your project. They require a quick compute restart, take only a few seconds, and typically occur weekly.

On the Free plan, updates are automatically scheduled. On paid plans, you can set a preferred day and time for updates. Restarts occur within your selected time window and take only a few seconds.

To set your project&#x27;s update schedule or view currently scheduled updates:

- Go to **Settings** > **Postgres** and find **Updates**.

- Choose a day of the week and an hour. Updates will occur within this time window and take only a few seconds.

For more information, see [Updates](/docs/manage/updates).

### Give someone access to a project[](#give-someone-access-to-a-project)

How you grant access depends on whether the person is already in your organization:

- **Organization members**: Grant them a per-project permission (**Viewer**, **Editor**, or **Admin**) from the project&#x27;s **Settings** → **Project permissions** page. This is also how you give a member more access on one project than their organization role provides. See [Assign project access](/docs/manage/user-permissions#assign-project-access).

- **People outside your organization**: Invite them as a collaborator, as described below.

#### Invite collaborators to a project[](#invite-collaborators-to-a-project)

Neon&#x27;s project collaboration feature allows you to invite external Neon accounts to collaborate on a Neon project.

#### note

Project sharing is being deprecated and will be removed in a future release. To give a contractor or other limited-access user access to specific projects, add them to the organization as a **Collaborator** and grant per-project permissions instead. See [User permissions](/docs/manage/user-permissions).

Organization members can&#x27;t be added as collaborators on organization-owned projects. Grant them a per-project permission instead.

To invite collaborators to a Neon project:

- In the Neon Console, select a project.

- Select **Settings**.

- Select **Sharing**.

- Select **Invite** and enter the email address of the account you want to collaborate with.

- Click **Invite**.

The email you specify is added to the list of **Collaborators**. The Neon account associated with that email address is granted full access to the project, with the exception of privileges required to delete the project. This account can also invite other Neon users to the project. When that user logs in to Neon, the project they were invited to is listed on their **Projects** page under **Shared with you**.

The costs associated with projects being collaborated on are charged to the Neon account that owns the project. For example, if you invite another Neon user account to a project you own, any usage incurred by that user within your project is billed to your Neon account, not theirs.

For additional information, refer to our [Project collaboration guide](/docs/guides/project-collaboration-guide).

### Configure IP Allow[](#configure-ip-allow)

The IP Allow feature provides an added layer of security for your data, restricting access to the branch where your database resides to only those IP addresses that you specify. In Neon, the IP allowlist is applied to all branches by default.

Optionally, you can allow unrestricted access to your project&#x27;s non-protected branches. For instance, you might want to restrict access to protected branches to a handful of trusted IPs while allowing unrestricted access to your development branches.

By default, Neon allows IP addresses from `0.0.0.0`, which means that Neon accepts connections from any IP address. Once you configure IP Allow by adding IP addresses or ranges, only those IP addresses will be allowed to access Neon.

#### note

Neon projects provisioned on AWS support both [IPv4](https://en.wikipedia.org/wiki/Internet_Protocol_version_4) and [IPv6](https://en.wikipedia.org/wiki/IPv6) addresses. Neon project provisioned on Azure currently on support IPv4.

Neon ConsoleCLIAPITo configure an allowlist:

- Select a project in the Neon Console.

- On the **Project Dashboard**, select **Settings**.

- Select **Networking**.

- Under **Public internet access**, select **Only addresses on the allowlist**, then specify the IP addresses you want to permit. Separate multiple entries with commas.

- Optionally, select **Restrict IP Access to protected branches only** to restrict access to only the branches you have designated as protected.

- Click **Save changes**.

#### How to specify IP addresses[](#how-to-specify-ip-addresses)

You can define an allowlist with individual IP addresses, IP ranges, or [CIDR notation](/docs/reference/glossary#cidr-notation). A combination of these options is also permitted. Multiple entries, whether they are the same or of different types, must be separated by a comma. Whitespace is ignored.

**Add individual IP addresses**: You can add individual IP addresses that you want to allow. This is useful for granting access to specific users or devices. This example represents a single IP address:

```
192.0.2.1
```

**Define IP ranges**: For broader access control, you can define IP ranges. This is useful for allowing access from a company network or a range of known IPs. This example range includes all IP addresses from `198.51.100.20` to `198.51.100.50`:

```
198.51.100.20-198.51.100.50
```

**Use CIDR notation**: For more advanced control, you can use [CIDR (Classless Inter-Domain Routing) notation](/docs/reference/glossary#cidr-notation). This is a compact way of defining a range of IPs and is useful for larger networks or subnets. Using CIDR notation can be advantageous when managing access to branches with numerous potential users, such as in a large development team or a company-wide network.

This CIDR notation example represents all 256 IP addresses from `203.0.113.0` to `203.0.113.255`.

```
203.0.113.0/24
```

**Use IPv6 addresses**: Neon projects provisioned on AWS also support specifying IPv6 addresses. For example:

#### note

IPv6 is not yet supported for projects provisioned on Azure.

```
2001:DB8:5432::/48
```

A combined example using all three options above, specified as a comma-separated list, would appear similar to the following:

```
192.0.2.1, 198.51.100.20-198.51.100.50, 203.0.113.0/24, 2001:DB8:5432::/48
```

This list combines individual IP addresses, a range of IP addresses, a CIDR block, and an IPv6 address. It illustrates how different types of IP specifications can be used together in a single allowlist configuration, offering a flexible approach to access control.

#### Update an IP Allow configuration[](#update-an-ip-allow-configuration)

You can update your IP Allow configuration via the Neon Console or API as described in [Configure IP Allow](#configure-ip-allow). Replace the current configur

... [Content truncated]