#!/usr/bin/env bash
# Claude Code status line:
#   Model display name | project (git branch) | Xk/Yk [progress bar] Z%

input=$(cat)

# --- Model ---
model=$(echo "$input" | jq -r '.model.display_name // "Claude"')

# --- Project name (basename of cwd) ---
cwd=$(echo "$input" | jq -r '.workspace.current_dir // .cwd // empty')
if [ -n "$cwd" ]; then
  project=$(basename "$cwd")
else
  project=$(basename "$PWD")
fi

# --- Git branch (skip optional locks to avoid contention) ---
branch=$(git -C "${cwd:-$PWD}" --no-optional-locks symbolic-ref --short HEAD 2>/dev/null)
if [ -n "$branch" ]; then
  project_str="${project} (${branch})"
else
  project_str="${project}"
fi

# --- Context window fields ---
used_pct=$(echo "$input" | jq -r '.context_window.used_percentage // 0')
ctx_size=$(echo "$input" | jq -r '.context_window.context_window_size // 0')
used_int=$(printf "%.0f" "$used_pct")
total_k=$(( (ctx_size + 500) / 1000 ))
used_k=$(( total_k * used_int / 100 ))

# Build 20-char progress bar
bar_width=20
filled=$(( used_int * bar_width / 100 ))
empty=$(( bar_width - filled ))
bar=""
for i in $(seq 1 $filled); do bar="${bar}█"; done
for i in $(seq 1 $empty);  do bar="${bar}░"; done

# Color: green < 60%, yellow 60-84%, red >= 85%
if [ "$used_int" -ge 85 ]; then
  color="\033[31m"   # red
elif [ "$used_int" -ge 60 ]; then
  color="\033[33m"   # yellow
else
  color="\033[32m"   # green
fi
reset="\033[0m"

printf "%s | %s | %dk/%dk ${color}[%s]${reset} %d%%" \
  "$model" "$project_str" "$used_k" "$total_k" "$bar" "$used_int"
