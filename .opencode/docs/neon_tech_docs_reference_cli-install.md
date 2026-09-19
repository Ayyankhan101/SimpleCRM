# Neon CLI: Install and connect - Neon Docs

> Source: https://neon.tech/docs/reference/cli-install
> Cached: 2026-09-18T17:23:12.647Z

---

# Neon CLI: Install and connect

Install the Neon CLI and connect with web auth or API key

Copy page## Install[](#install)

Install the Neon CLI globally with [npm](https://www.npmjs.com/package/neon):

```
npm i -g neon@latest
```

Requires [Node.js 20.19.0](https://nodejs.org/en/download/) or higher. The CLI is invoked as `neon`, and `neonctl` is an alias for `neon`.

Other install optionsHomebrew, bun, and standalone binaries are also available. The Homebrew formula is named `neonctl`, so install commands use that name even though you run the CLI as `neon`.

macOSWindowsLinux**Install with [Homebrew](https://formulae.brew.sh/formula/neonctl)**

`brew install neonctl`**Install with bun**

`bun install -g neon`**macOS binary**

Download the binary. No installation required.

`curl -sL https://github.com/neondatabase/neon-pkgs/releases/latest/download/neon-macos-x64 -o neon`Run the CLI from the download directory:

`neon <command> [options]`You can also run the Neon CLI without installing it using **npx** or the `bun` equivalent, **bunx**:

```
# npx
npx neon <command>

# bunx
bunx neon <command>
```

### Upgrade[](#upgrade)

Upgrade using the method that matches how you installed the CLI. To check for the latest version, see the [Neon CLI **Releases** page](https://github.com/neondatabase/neon-pkgs/releases). To check your installed version, run:

```
neon --version
```

#### Node.js 20.19.0 is required to upgrade

The current CLI requires Node.js 20.19.0 or higher. An existing installation keeps working on your current Node.js version, but upgrading to the latest CLI on an older version (such as Node.js 18) fails. If you&#x27;re on an older version, [upgrade Node.js](https://nodejs.org/en/download/) before you upgrade the CLI.

npmHomebrewBinary```
npm update -g neon
```

In CI/CD tools like GitHub Actions, you can safely pin the Neon CLI to `latest`, as we prioritize stability for CI/CD processes.

npm (recommended)BinaryIn your GitHub Actions workflow, use the `latest` tag with `npm`:

```
- name: Install Neon CLI
  run: npm install -g neon@latest
```

## Connect[](#connect)

The Neon CLI supports connecting via web authentication or API key.

### Web authentication[](#web-authentication)

Run the following command to connect to Neon via web authentication:

```
neon login
```

The [neon login](/docs/cli/login) command launches a browser window where you can authorize the Neon CLI to access your Neon account. If you haven&#x27;t authenticated previously, running any Neon CLI command launches the web authentication process automatically unless you&#x27;ve specified an API key.

#### note

If you use Neon through the [Vercel-Managed Integration](/docs/guides/vercel-managed-integration), you must authenticate connections from the CLI client using a Neon API key (see below). The `neon login` command requires an account registered through Neon rather than Vercel.

### API key[](#api-key)

To authenticate with a Neon API key, specify the `--api-key` option when running a Neon CLI command:

```
neon projects list --api-key <neon_api_key>
```

To avoid including `--api-key` with each command, export your API key to the `NEON_API_KEY` environment variable.

```
export NEON_API_KEY=<neon_api_key>
```

For information about obtaining a Neon API key, see [Creating API keys](/docs/manage/api-keys#creating-api-keys).

## Configure autocompletion[](#configure-autocompletion)

The Neon CLI supports autocompletion. See [Neon CLI commands: completion](/docs/cli/completion) to set it up.