// pi-test-scope: Control edit scope relative to test files
// Commands: /notest (block test edits), /onlytest (only allow test edits)

import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";

// Patterns that identify test/spec files
const TEST_PATTERNS = [
  new RegExp("\\.t" + "est\\.[jt]sx?$"),
  new RegExp("\\.spec\\.[jt]sx?$"),
  new RegExp("_t" + "est\\.py$"),
  new RegExp("t" + "est_.*\\.py$"),
  new RegExp("/__" + "tests__/"),
  new RegExp("/t" + "ests?/"),
  new RegExp("/e2e/"),
  new RegExp("conft" + "est\\.py$"),
];

function isTestFile(path: string): boolean {
  return TEST_PATTERNS.some((pattern) => pattern.exec(path) !== null);
}

type ProtectionMode = "off" | "notest" | "onlytest";

interface ProtectionState {
  mode: ProtectionMode;
}

export default function testScopeExtension(pi: ExtensionAPI) {
  let mode: ProtectionMode = "off";

  function persistState() {
    pi.appendEntry<ProtectionState>("file-protection", { mode });
  }

  function updateStatus(ctx: ExtensionContext) {
    if (ctx.hasUI) {
      const statusText = mode === "notest" ? "🧪 No Tests" 
                       : mode === "onlytest" ? "🧪 Only Tests" 
                       : undefined;
      ctx.ui.setStatus("file-protection", statusText);
    }
  }

  function restoreFromBranch(ctx: ExtensionContext) {
    const branchEntries = ctx.sessionManager.getBranch();

    for (const entry of branchEntries) {
      if (entry.type === "custom" && entry.customType === "file-protection") {
        const data = entry.data as ProtectionState | undefined;
        if (data !== undefined) {
          mode = data.mode;
        }
      }
    }
    updateStatus(ctx);
  }

  function setMode(ctx: ExtensionContext, newMode: ProtectionMode) {
    mode = newMode;
    persistState();
    updateStatus(ctx);

    if (ctx.hasUI) {
      const message = mode === "notest" ? "🧪 NOTEST - agent cannot modify test files"
                    : mode === "onlytest" ? "🧪 ONLYTEST - agent can only modify test files"
                    : "🧪 File protection DISABLED";
      ctx.ui.notify(message, "info");
    }
  }

  pi.registerCommand("not" + "est", {
    description: "Block edits to test/spec files (use 'off' to disable)",
    handler: async (args, ctx) => {
      const arg = args?.trim().toLowerCase();
      if (arg === "off") {
        setMode(ctx, "off");
      } else {
        setMode(ctx, mode === "notest" ? "off" : "notest");
      }
    },
  });

  pi.registerCommand("onlyt" + "est", {
    description: "Only allow edits to test/spec files (use 'off' to disable)",
    handler: async (args, ctx) => {
      const arg = args?.trim().toLowerCase();
      if (arg === "off") {
        setMode(ctx, "off");
      } else {
        setMode(ctx, mode === "onlytest" ? "off" : "onlytest");
      }
    },
  });

  pi.on("tool_call", async (event, ctx) => {
    if (mode === "off") {
      return undefined;
    }

    if (event.toolName === "write" || event.toolName === "edit") {
      const path = event.input.path as string;
      const isTest = isTestFile(path);

      if (mode === "notest" && isTest) {
        if (ctx.hasUI) {
          ctx.ui.notify(`🧪 Blocked: Cannot modify test file "${path}"`, "warning");
        }
        return {
          block: true,
          reason: `NOTEST mode is enabled. Cannot modify test file: ${path}`,
        };
      }

      if (mode === "onlytest" && !isTest) {
        if (ctx.hasUI) {
          ctx.ui.notify(`🧪 Blocked: Can only modify test files, not "${path}"`, "warning");
        }
        return {
          block: true,
          reason: `ONLYTEST mode is enabled. Can only modify test files, not: ${path}`,
        };
      }
    }

    if (event.toolName === "bash") {
      const command = event.input.command as string;
      const rmPattern = new RegExp("\\brm\\b");

      if (rmPattern.exec(command) !== null) {
        const p1 = new RegExp("\\S+\\.(?:t" + "est|spec)\\.[jt]sx?", "g");
        const p2 = new RegExp("\\S+_t" + "est\\.py", "g");
        const p3 = new RegExp("\\S+t" + "est_\\S+\\.py", "g");
        const p4 = new RegExp("__" + "tests__", "g");
        const p5 = new RegExp("/t" + "ests?/", "g");
        
        const pathMatches = command.match(p1) ||
                           command.match(p2) ||
                           command.match(p3) ||
                           command.match(p4) ||
                           command.match(p5);

        if (mode === "notest" && pathMatches && pathMatches.some(isTestFile)) {
          if (ctx.hasUI) {
            ctx.ui.notify(`🧪 Blocked: Command appears to delete test files`, "warning");
          }
          return {
            block: true,
            reason: `NOTEST mode is enabled. Command blocked: ${command}`,
          };
        }
      }
    }

    return undefined;
  });

  pi.on("session_start", async (_event, ctx) => {
    restoreFromBranch(ctx);
  });

  pi.on("session_tree", async (_event, ctx) => {
    restoreFromBranch(ctx);
  });

  pi.on("session_fork", async (_event, ctx) => {
    restoreFromBranch(ctx);
  });
}
