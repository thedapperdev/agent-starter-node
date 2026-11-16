<a href="https://livekit.io/">
  <img src="./.github/assets/livekit-mark.png" alt="LiveKit logo" width="100" height="100">
</a>

# LiveKit Agents starter for Node.js

A starter project for building voice AI apps with [LiveKit Agents for Node.js](https://github.com/livekit/agents-js) and [LiveKit Cloud](https://cloud.livekit.io/).

The starter includes:

- A simple [voice AI assistant](https://docs.livekit.io/agents/start/voice-ai/) to extend and customize.
- A voice pipeline built on [LiveKit Inference](https://docs.livekit.io/agents/models/inference/), which gives you access to [models](https://docs.livekit.io/agents/models/) from top labs with no extra configuration:
  - The default LLM is Gemma 4 31B, an open-weight model [hosted by LiveKit](https://docs.livekit.io/agents/models/llm/livekit/) and tuned for voice AI.
  - The default TTS is [Fish Audio S2.1 Pro](https://docs.livekit.io/agents/models/tts/fishaudio/), an expressive and cost-effective voice.
  - More than 50 other models are available from OpenAI, Cartesia, Deepgram, and other providers.
  - [Realtime models](https://docs.livekit.io/agents/models/realtime/) such as OpenAI GPT-Live, OpenAI GPT Realtime, xAI Grok Voice, and Google Gemini Live, also with no provider API key.
  - Many other models are available through the [plugin ecosystem](https://docs.livekit.io/agents/models/#plugins).
- [Expressive mode](https://docs.livekit.io/agents/models/tts/expressive/), on by default, so your agent's voice carries emotion and pacing that fit the conversation.
- [LiveKit Turn Detector](https://docs.livekit.io/agents/logic/turns/turn-detector/), which knows when the user has finished speaking, in 14 languages.
- [Adaptive interruption handling](https://docs.livekit.io/agents/logic/turns/adaptive-interruption-handling/), which tells a real interruption from an "uh-huh" or background noise, so your agent doesn't stop talking when it shouldn't.
- [Background voice cancellation](https://docs.livekit.io/transport/media/noise-cancellation/).
- Session transcripts, traces, and recordings from LiveKit [Agent Observability](https://docs.livekit.io/testing/observability/).
- [Simulations](https://docs.livekit.io/testing/simulations/) that test full conversations with your agent, run in CI on every merge to `main`.
- A `Dockerfile` for [deploying to LiveKit Cloud](https://docs.livekit.io/deploy/agents/).

The starter works with any [custom web or mobile frontend](https://docs.livekit.io/frontends/) or with [telephony](https://docs.livekit.io/telephony/).

## This fork: local LiveKit + OpenAI GPT-Live

This branch uses the official OpenAI plugin with `gpt-live-1`, the `marin`
voice and Responses delegation to `gpt-6-luna`. The voice prompt uses OpenAI's
`Generate <|SpawnThinking|>` instruction for careful reasoning and corrections
to delegated work. It requests a brief, natural acknowledgement while that work
runs; ordinary conversation does not require delegation.

The SDK owns the full-duplex audio and delegation lifecycle. There is no custom
transcript scheduler, application-specific intake, persistence or orchestration.
No search, booking or answer-saving tools are configured. Both voice and delegated
reasoning use the OpenAI account configured by `OPENAI_API_KEY`.

Use Node 24 (`nvm use`) and pnpm 10.33.2. Install with `pnpm install --frozen-lockfile`.
Copy `.env.example` to `.env.local`, then set:

```dotenv
LIVEKIT_URL=ws://127.0.0.1:7880
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=secret
OPENAI_API_KEY=your-private-key
```

The LiveKit values above are the official local development credentials, not
production credentials. Keep the server bound to loopback:

```sh
livekit-server --dev --bind 127.0.0.1
```

In another terminal, run `pnpm dev --deployment production` to register the idle
agent worker in the default namespace on this local server. Here, `production`
selects that namespace; it does not deploy to a hosted environment. The companion
React starter at `http://localhost:3000` dispatches to agent name `my-agent`.
To talk
to the agent yourself using your microphone and speakers, run `lk agent console`
from this directory. Press `q` to end the console session. The console connects
directly to the local agent; it does not require the worker or a web frontend.
Starting a conversation uses your OpenAI account and incurs model charges.

`pnpm typecheck`, `pnpm lint` and `pnpm format:check` are offline checks.
The upstream example test is commented out; there is no active behavioural
suite. The debugger and simulations use real inference, so they are separate
from those offline checks and require explicit approval before an automated run.
The retained scenarios cover calculation, corrected figures and unavailable tools;
they have not been run for this configuration. Text scenarios cannot establish
full-duplex interruption behaviour or audible latency.

For a manual browser check, start a new call, ask the quote comparison from
`scenarios.yaml`, and correct the upfront fee while the assistant is working.
Check both time to acknowledgement and time to the correct substantive answer;
hearing a quick acknowledgement alone is not latency acceptance. Confirm that
ordinary conversation does not repeatedly announce background work. Model access,
actual delegation, correction handling and speech quality remain unverified until
this configuration is exercised with a real call.

References: [GPT-Live plugin](https://docs.livekit.io/agents/models/realtime/gpt-live/),
[OpenAI prompting](https://developers.openai.com/api/docs/guides/live-prompting),
[OpenAI delegation](https://developers.openai.com/api/docs/guides/live-delegation)
and [local LiveKit server](https://docs.livekit.io/transport/self-hosting/local/).

The rest of this README is the upstream template guide. Its Cloud inference,
noise-cancellation and expressive-pipeline descriptions do not describe this
branch's direct OpenAI GPT-Live configuration.

## Using coding agents

This project works with coding agents like [Claude Code](https://claude.com/product/claude-code), [Cursor](https://www.cursor.com/), and [Codex](https://openai.com/codex/).

LiveKit offers both a CLI and an [MCP server](https://docs.livekit.io/reference/developer-tools/docs-mcp/) for browsing and searching its documentation. Search returns short excerpts, so fetch the full page to read the details:

```console
lk docs search "testing my agent"
lk docs get-page /testing/unit-tests
```

The project also includes an [`AGENTS.md`](AGENTS.md) file, so your coding agent follows LiveKit's best practices for workflows, handoffs, and testing, and tries its changes with the [agent debugger](https://docs.livekit.io/testing/debugger/).

For more guidance at each stage of the work, from building and debugging to testing and deploying, install LiveKit's [agent skills](https://docs.livekit.io/intro/coding-agents/#agent-skills). The CLI installs them for the coding agents on your machine and adds the Docs MCP server to their config. `lk agent init` offers to do this when it creates your project, or you can run it yourself:

```console
lk skills install
```

Run `lk skills update` to get the latest skills, and commit `skills-lock.json` along with them. See the [coding agents guide](https://docs.livekit.io/intro/coding-agents/) for more details.

## Dev setup

Install the [LiveKit CLI](https://docs.livekit.io/intro/basics/cli/), version 2.18.8 or later:

- **macOS:** `brew install livekit-cli`
- **Linux:** `curl -sSL https://get.livekit.io/cli | bash`
- **Windows:** `winget install LiveKit.LiveKitCLI`

Check your version with `lk --version`. To update an existing install, see [Update the CLI](https://docs.livekit.io/reference/developer-tools/livekit-cli/#updates).

Then create a project from this template. The CLI clones the template and configures your environment:

```console
lk cloud auth
lk agent init my-agent --template agent-starter-node
```

<details>
<summary>Set up the project manually</summary>

Clone the repository and install dependencies with [pnpm](https://pnpm.io/):

```console
git clone https://github.com/livekit-examples/agent-starter-node.git
cd agent-starter-node
pnpm install
```

Sign up for [LiveKit Cloud](https://cloud.livekit.io/), then copy `.env.example` to `.env.local` and fill it in. To have the CLI write your project's URL and API keys into the file instead, run:

```console
lk cloud auth
lk app env --write --destination .env.local
```

</details>

## Run the agent

The `lk agent console`, `lk agent dev`, and `lk agent debugger` commands run your agent on your own machine. To talk to it in your terminal:

```console
lk agent console
```

To connect it to LiveKit Cloud so a frontend, a phone call, or the [Agent Console](https://docs.livekit.io/testing/agent-console/) can reach it:

```console
lk agent dev
```

To let a coding agent or a script test it one text turn at a time, use the [agent debugger](https://docs.livekit.io/testing/debugger/). Each turn prints the agent's reply along with the tool calls and handoffs behind it:

```console
lk agent debugger start
lk agent debugger say "Hi, what can you do?"
lk agent debugger stop
```

In production, run the agent directly:

```console
node src/main.ts start
```

## Frontends and telephony

Pair the agent with a prebuilt frontend starter, or add telephony:

| Platform         | Link                                                                                                                | Description                                        |
| ---------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| **Web**          | [`livekit-examples/agent-starter-react`](https://github.com/livekit-examples/agent-starter-react)                   | Web voice AI assistant with React & Next.js        |
| **iOS/macOS**    | [`livekit-examples/agent-starter-swift`](https://github.com/livekit-examples/agent-starter-swift)                   | Native iOS, macOS, and visionOS voice AI assistant |
| **Flutter**      | [`livekit-examples/agent-starter-flutter`](https://github.com/livekit-examples/agent-starter-flutter)               | Cross-platform voice AI assistant app              |
| **React Native** | [`livekit-examples/voice-assistant-react-native`](https://github.com/livekit-examples/voice-assistant-react-native) | Native mobile app with React Native & Expo         |
| **Android**      | [`livekit-examples/agent-starter-android`](https://github.com/livekit-examples/agent-starter-android)               | Native Android app with Kotlin & Jetpack Compose   |
| **Web Embed**    | [`livekit-examples/agent-starter-embed`](https://github.com/livekit-examples/agent-starter-embed)                   | Voice AI widget for any website                    |
| **Telephony**    | [Documentation](https://docs.livekit.io/telephony/)                                                                 | Add inbound or outbound calling to your agent      |

For more options, see the [frontend guide](https://docs.livekit.io/frontends/).

## Testing and debugging

Simulations run full multi-turn conversations between a simulated user and your agent on LiveKit Cloud, then judge each transcript. The scenarios live in [`scenarios.yaml`](scenarios.yaml). Run them locally with the CLI:

```console
lk agent simulate text --scenarios scenarios.yaml
```

The `Simulations` workflow in [`.github/workflows/simulations.yml`](.github/workflows/simulations.yml) runs the same file on every merge to `main`, and on demand from the Actions tab. It doesn't run on every pull request push because each run uses real inference. See the [simulations guide](https://docs.livekit.io/testing/simulations/) for how to write scenarios and read results.

To check a change turn by turn without a live session, use the [agent debugger](https://docs.livekit.io/testing/debugger/) shown in [Run the agent](#run-the-agent).

To debug a running agent, open it in the [Agent Console](https://docs.livekit.io/testing/agent-console/). It shows events, tool calls, and model timing as you talk to the agent. To stream logs from a deployed agent, run `lk agent logs`.

## Using this template for your own project

After you create your own project from this template:

- **Commit `pnpm-lock.yaml`.** The template doesn't track it, but your project should, for reproducible builds. If you deploy to LiveKit Cloud, commit `livekit.toml` too.
- **Add repository secrets.** Add `LIVEKIT_URL`, `LIVEKIT_API_KEY`, and `LIVEKIT_API_SECRET` as [repository secrets](https://docs.github.com/en/actions/how-tos/writing-workflows/choosing-what-your-workflow-does/using-secrets-in-github-actions) so the simulations can run in CI.

## Deploying to production

To deploy the agent to LiveKit Cloud or another environment with the included `Dockerfile`, see the [deployment guide](https://docs.livekit.io/deploy/agents/).

## Self-hosted LiveKit

You can self-host LiveKit instead of using LiveKit Cloud. See the [self-hosting guide](https://docs.livekit.io/transport/self-hosting/local/). If you self-host, use [model plugins](https://docs.livekit.io/agents/models/#plugins) instead of LiveKit Inference, and remove the [LiveKit Cloud noise cancellation](https://docs.livekit.io/transport/media/noise-cancellation/) plugin.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
