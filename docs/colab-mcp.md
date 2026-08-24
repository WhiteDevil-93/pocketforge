# Driving a Colab GPU from the agent (colab-mcp)

[`googlecolab/colab-mcp`](https://github.com/googlecolab/colab-mcp) is Google's MCP server
that hands an agent a Google Colab notebook as a remote runtime — free T4-class GPU
included. For PocketForge it is the cheapest place to do the parts of the on-device LLM
work that need a GPU but not a long-lived machine: GGUF quantisation, `.litertlm`
conversion, template round-trip checks, short QLoRA runs on `vgc_gemma2`.

The repo ships the client config in [`.mcp.json`](../.mcp.json). This document is about
the one thing the upstream README does not say out loud: **where this works, and where it
does not.**

## The constraint, first

colab-mcp is *not* a hosted service the agent talks to over the network. It is a local
process that bridges to a Colab tab **open in a browser on the same machine**:

1. The server starts a WebSocket listener on `localhost:<random port>` and mints a
   16-byte token.
2. The injected `open_colab_browser_connection` tool calls Python's `webbrowser.open_new`
   on `https://colab.research.google.com/notebooks/empty.ipynb#mcpProxyToken=…&mcpProxyPort=…`.
3. The Colab **frontend** reads that URL fragment and dials back into
   `ws://localhost:<port>`. The listener only accepts `Origin:` of
   `colab.research.google.com` or `colab.google.com`, and only one connection at a time
   (a second gets close code `1013`, "Server is busy").
4. Every real notebook tool — add/edit/run/delete cells, dependency installs, runtime and
   GPU assignment — is **proxied from that browser tab**. Until it connects, the server
   exposes exactly one tool. That is why the client must support
   `notifications/tools/list_changed`: the tool list appears when you connect and vanishes
   when the tab closes.

| Where you run Claude Code | Works? |
|---|---|
| CLI on a laptop/desktop with a browser | Yes — this is the supported path |
| VS Code / JetBrains extension, same machine | Yes |
| **Claude Code on the web, or any remote/cloud session** | **No** |
| Phone only | No |

The remote case fails twice over: `webbrowser.open_new` fires inside a container nobody is
looking at, and the `localhost` the Colab tab in *your* browser would dial is your phone,
not the container. Tunnelling a port back is theoretically possible and practically not
worth it — the browser has to reach the listener as `localhost` for the origin/token dance
to line up.

**Consequence for this project:** the rest of `docs/` is deliberately phone-drivable —
[`drive-to-gcp-model-transfer.md`](./drive-to-gcp-model-transfer.md) exists precisely so a
model can be moved with no laptop in the loop. colab-mcp is the opposite: it is the
laptop-only tool. Reach for it when you are at a real machine; reach for the GCE T4 recipe
when you are not.

## Setup

```bash
pip install uv       # uvx comes with it
```

`.mcp.json` in the repo root already declares the server, so opening Claude Code in this
directory picks it up (approve it once when prompted). Verify with `/mcp`.

First launch resolves and builds the package from git, which can take longer than the
default MCP startup timeout. If it times out, raise it for that launch:

```bash
MCP_TIMEOUT=30000 claude
```

colab-mcp requires **Python ≥ 3.13**; `uvx` will fetch a suitable interpreter itself, so
your system Python version does not matter.

Then, in a session:

1. Call `open_colab_browser_connection`. A Colab tab opens and the tool reports progress
   while it waits — it gives up after **60 seconds**.
2. Sign in to Colab in that tab if you are not already. The connection completes and the
   notebook tools appear.
3. Set the accelerator in the notebook (**Runtime → Change runtime type**) or ask the agent
   to — GPU assignment is one of the proxied capabilities.

Keep the tab open. Closing it drops the tools mid-session.

To use a specific notebook instead of the scratch one, open it yourself and append the same
`#mcpProxyToken=…&mcpProxyPort=…` fragment from the server log
(`/tmp/colab-mcp-logs-*/colab-mcp.*.log`, or pass `--log <dir>`).

## What it is good for here

Colab's free tier is a *scratch* GPU: sessions are reclaimed on idle, disks do not persist,
and there is no SLA. That maps cleanly onto some of the model work and badly onto the rest.

| Task | Colab | Notes |
|---|---|---|
| GGUF quantise / requantise an existing `safetensors` checkpoint | Good | CPU/RAM-bound, minutes, output is a few GB |
| `.litertlm` conversion for the LiteRT-LM path in [`on-device-llm.md`](./on-device-llm.md) | Good | One-shot, no state to lose |
| Extract and eyeball the GGUF chat template (see [`local-llm-verification.md`](./local-llm-verification.md) §3) | Good | Pure inspection |
| Short QLoRA / LoRA run on Gemma-2 | Workable | Checkpoint to Drive every N steps; a reclaimed session loses everything on local disk |
| Multi-hour full fine-tune | Bad | Use the GCE T4 (~$0.55/hr) from [`drive-to-gcp-model-transfer.md`](./drive-to-gcp-model-transfer.md) |
| Anything holding a >10 GB working set on disk | Bad | Same |

Mount Drive in the notebook and write outputs there, not to `/content`. That also drops the
finished artefact straight into the folder the GCE fetch script and the Android SAF import
already read from — the model path stays Drive-centric end to end.

Remember the constraint from the GCE doc: **GGUF is an inference format.** You cannot resume
training from it or merge an adapter into it. Anything that trains needs the original
`safetensors` in the notebook.

## Security notes

Worth knowing before pointing an agent at it:

- The proxy token travels in a **URL fragment**, so it is not sent to Google's servers — but
  it does land in browser history. The token dies with the server process.
- The listener binds `localhost` only, checks `Origin`, and accepts a single connection. It
  is not reachable from your network.
- Everything the agent runs executes **in your Colab account**, against your Drive if you
  mount it. The blast radius is that account, not your machine — which is the point, but it
  is not zero.
- Do not paste secrets into notebook cells. Colab notebooks are Drive files and autosave.

## Troubleshooting

**Only `open_colab_browser_connection` is listed, or no colab-mcp tools at all** — the
browser side never connected. Confirm the Colab tab is open and signed in, then call the
tool again. If you are in a remote session, see the constraint above; it will not work.

**"Server is busy" / the tab connects and immediately drops** — an earlier Colab tab still
holds the single allowed connection. Close the stale tabs and retry.

**Tools disappear mid-session** — the tab was closed, went to sleep, or the runtime was
reclaimed. Re-run `open_colab_browser_connection`.

**MCP server fails to start** — `uvx --help` to confirm `uv` is installed and on `PATH`. On
a non-default package index, add `"--index", "https://pypi.org/simple"` to the `args` in
`.mcp.json`.

**Timeout at startup** — see `MCP_TIMEOUT` above; the first `uvx` run builds from git.

## Notes

- Upstream does not accept external PRs. Bugs and feature requests go to their
  [discussions](https://github.com/googlecolab/colab-mcp/discussions), not the issue tracker.
- Tool names beyond `open_colab_browser_connection` are served by the Colab frontend, not by
  the Python package, so they can change without a release. `/mcp` shows the live list once
  connected.
- Apache 2.0.
