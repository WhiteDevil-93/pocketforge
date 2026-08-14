# Moving a model from Google Drive to a GCE instance

How to get a multi-GB model file out of Google Drive and onto a GPU instance, driven
entirely from a phone. Written for `gemma-4-E2B-it-Q4_K_M.gguf` (3.11 GB) but the script
takes any file name.

The companion script is [`scripts/gcp-fetch-model-from-drive.sh`](../scripts/gcp-fetch-model-from-drive.sh).

## The approach, and why

The instance pulls from Drive itself. Nothing proxies the bytes through a laptop, a phone,
or a chat session.

Authentication uses the **instance's attached service account via the metadata server**, so
there is no JSON key to create, download, and paste into a terminal — the step that makes
the usual service-account recipe impractical from a phone. The trade is that two things
must be set up in advance, and both are one-time:

- the instance needs a **Drive access scope**, which can only be set while it is stopped;
- the Drive file needs to be **shared with the service account's email**.

That second one catches people out. Drive permissions are entirely separate from IAM.
Granting the service account Owner on the project gives it nothing in your Drive — the
share has to happen on the Drive side.

## One-time setup

### 1. Enable the Drive API

Console → **APIs & Services → Enable APIs and Services → Google Drive API → Enable**,
in the project that owns the instance.

### 2. Share the file with the service account

In the Drive app (or drive.google.com): long-press the file or its folder → **Share** →
paste the service account address, e.g.

```
themyscira@themyscira-485918.iam.gserviceaccount.com
```

→ set to **Viewer** → Send. Untick "Notify people" — nothing can read the mail.

Sharing the *folder* covers everything inside it in one action, including anything added
later. Sharing the single *file* is tighter if the folder holds anything the service
account has no business reading.

Drive may warn that the address is outside your organisation. That is expected for a
service account.

### 3. Create the instance with a Drive scope

Use **console.cloud.google.com in a mobile browser with "Desktop site" enabled**. The
Google Cloud app's instance-creation screen cannot set access scopes or a startup script.

| Field | Value | Why |
|---|---|---|
| Machine type | `n1-standard-4` + 1× NVIDIA T4 | |
| Zone | `us-west4-b` | T4 capacity is uneven; this zone has had it |
| Provisioning model | **Standard**, not Spot | Spot instances get preempted mid-download |
| Boot disk | **Deep Learning on Linux**, CUDA 12.x, ≥ 150 GB | Ships the NVIDIA driver, so no DKMS build |
| Identity → Service account | the account you shared the file with | |
| Identity → Access scopes | **Set access for each API** → **Drive: Enabled** | The setting that makes the keyless download work |

Access scopes **cannot be changed on a running instance**. Getting this wrong means a stop,
a `gcloud compute instances set-service-account`, and a start — so set it at creation.
`cloud-platform` does *not* imply Drive; it has to be ticked separately.

### 4. Optional: fetch on boot

Paste this into **Advanced options → Automation → Startup script** and the model is on disk
by the time the instance finishes booting, no SSH needed:

```bash
#!/bin/bash
set -o pipefail
curl -fsSL https://raw.githubusercontent.com/WhiteDevil-93/pocketforge/main/scripts/gcp-fetch-model-from-drive.sh | bash
```

`pipefail` matters here. `curl -f` on a bad URL exits non-zero and prints the error, but the
pipeline's status comes from `bash`, which succeeds on empty input — so without it a 404 would
leave the startup script "successful" and the model silently absent. With it, the failure shows
up in `journalctl -u google-startup-scripts`.

## Running it by hand

Console → Compute Engine → your instance → **SSH**, which opens a terminal in the browser.

```bash
curl -fsSL https://raw.githubusercontent.com/WhiteDevil-93/pocketforge/main/scripts/gcp-fetch-model-from-drive.sh | bash
```

Or with overrides:

```bash
curl -fsSLo fetch.sh https://raw.githubusercontent.com/WhiteDevil-93/pocketforge/main/scripts/gcp-fetch-model-from-drive.sh
chmod +x fetch.sh
MODEL_NAME=vgc_gemma2.gguf EXPECTED_SIZE=2784496032 ./fetch.sh
```

| Variable | Default | Meaning |
|---|---|---|
| `MODEL_NAME` | `gemma-4-E2B-it-Q4_K_M.gguf` | File name to look up in Drive |
| `FOLDER_ID` | `1uNWTdlI5nz21pXz5AJ_d9g-hyPJpeXU2` | Drive folder to search (`pocketforge`) |
| `EXPECTED_SIZE` | `3106738272` | Expected bytes; `0` disables the check |
| `DEST` | `/opt/models`, else `~/models` | Download directory |
| `LOG` | `/var/log/pocketforge-model-fetch.log`, else `~/…` | Log file |

The script resolves the file **by name**, so there is no file id to transcribe. It is safe
to re-run: an interrupted download resumes from where it stopped.

## Watching and verifying

```bash
tail -f /var/log/pocketforge-model-fetch.log
sudo journalctl -u google-startup-scripts -f   # if it ran as a startup script
```

On success the script confirms the byte count against what Drive reports and checks that
the file begins with the ASCII magic `GGUF`. That second check matters more than it looks:
when a Drive download fails on auth, the API returns a JSON or HTML error page, and `curl
-o` saves it under the `.gguf` name quite happily. The file exists, the download "succeeded",
and the failure only surfaces much later as an unintelligible loader error.

## Troubleshooting

**`this instance has no Drive access scope`** — the instance was created without it. Stop the
instance, then:

```bash
gcloud compute instances set-service-account INSTANCE --zone ZONE \
  --service-account SA_EMAIL \
  --scopes https://www.googleapis.com/auth/drive.readonly,https://www.googleapis.com/auth/cloud-platform
```

and start it again.

**`not found in folder`** — almost always the Drive share (step 2) is missing or went to the
wrong address. The script prints the service account it is actually running as; check that
address appears in the file's Drive sharing list. Also confirm the file name matches exactly,
including case.

**`more than one file named ...`** — Drive permits duplicate names within a folder, so a
re-upload can leave an older copy behind rather than replacing it. The script refuses to guess
between them. Delete the one you don't want (check the trash too), or point `FOLDER_ID` at a
folder containing only the copy you want.

**`Drive reports N bytes but expected M`** — either the upload to Drive was still running, or
the file legitimately changed. Confirm it looks complete in Drive, then re-run with
`EXPECTED_SIZE=N`.

**Download stalls or drops** — just re-run; it resumes. Drive's `alt=media` endpoint honours
HTTP range requests.

## Notes

- A service account with **Owner** on the project, attached to an instance, means anyone with
  SSH on that box can mint Owner credentials from the metadata server. Fine for a short-lived
  scratch VM; for anything longer, make a dedicated service account with no project roles —
  the Drive share is all it actually needs.
- T4 + `n1-standard-4` runs roughly **$0.55/hour**. Stop or delete the instance when idle.
- GGUF is a llama.cpp **inference** format. You cannot resume QLoRA training from it, and you
  cannot merge a LoRA adapter into it. Training needs the original `safetensors`.
