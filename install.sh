#!/usr/bin/env bash
# Install human into an agent's skills directory.
#   curl -fsSL https://raw.githubusercontent.com/e1i0r/human/main/install.sh | bash
#
# npm install -g @e1i0r/human gets you the commands. This gets you the skill as
# well, which is the half that tells an agent what to do with them.
set -euo pipefail

DEST="${HUMAN_DEST:-$HOME/.claude/skills/human}"
REPO="https://github.com/e1i0r/human"

command -v git >/dev/null || { echo "human: git is required"; exit 1; }
command -v node >/dev/null || { echo "human: node is required"; exit 1; }
node -e 'process.exit(Number(process.versions.node.split(".")[0]) < 20 ? 1 : 0)' \
  || { echo "human: node 20 or newer is required"; exit 1; }

if [ -d "$DEST/.git" ]; then
  echo "human: updating $DEST"
  git -C "$DEST" pull --quiet --ff-only
else
  [ -e "$DEST" ] && { echo "human: $DEST exists and is not a checkout"; exit 1; }
  mkdir -p "$(dirname "$DEST")"
  git clone --quiet --depth 1 "$REPO" "$DEST"
fi

# The files first, because a failing run is ambiguous: a checkout that came down
# empty fails for the same reason a working checker does, and the first version
# of this script called that success.
for f in bin/human.js hook/install.js test/fixtures/fixture-es.md; do
  [ -f "$DEST/$f" ] || { echo "human: $DEST/$f is missing, the checkout is incomplete"; exit 1; }
done

# Then the fixture, which is built to trip every detector and has to fail. An
# install that reports success on a checker matching nothing is the worse case.
if node "$DEST/bin/human.js" "$DEST/test/fixtures/fixture-es.md" >/dev/null 2>&1; then
  echo "human: the checker ran but the fixture passed, which should not happen"
  exit 1
fi
echo "human: installed in $DEST"

# Put the four commands on the PATH, straight from the checkout. npm installs a
# directory as happily as a published package, so this needs no registry, and
# `git pull` in the checkout updates what the commands run.
if command -v npm >/dev/null && npm install -g "$DEST" >/dev/null 2>&1; then
  echo "human: human, human-hooks, human-calibrate and human-voice are on your PATH"
  RUN="human"
else
  echo "human: npm could not link the commands, so run it by path"
  RUN="node $DEST/bin/human.js"
fi

# The hooks are what make this run without anybody remembering to. They ask
# first unless this script was told not to, and undo with --remove.
if [ "${1:-}" = "--with-hooks" ]; then
  node "$DEST/hook/install.js" --yes
else
  node "$DEST/hook/install.js" || true
fi

echo "human: $RUN YOUR_FILE.md"
