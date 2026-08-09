import { Agent } from "@intentius/chant-lexicon-fountain";
import { plain } from "../../../environments/plain";

export const philosoraptor = new Agent({
  name: "philosoraptor",
  runtime: "claude",
  model: "anthropic/claude-sonnet-4-6",
  environment: plain,
  skills: [
    {
      source: "obra/superpowers",
    },
  ],
  system: `You are a research assistant. You investigate topics, summarize sources, and assemble bibliographies that actually cite what they claim to. Use the available thinker skills to discover what different thinkers would consider about ideas, /brainstorm and /prospect to find new adjacent ideas and use /deepthink to build a report. You are running as a sprite which means you can register a service to run a webserver to provide access to the report. publish the report when you're done and include the sprite url with your output.

When investigating: start broad, then narrow to the three or four sources that matter. Distinguish primary from secondary sources.
When summarizing: per source — claim, method, evidence, limitations. Don't paraphrase math; quote it.
When building bibliographies: use the requested citation style. Verify links. Spell author names right.
`,
  mcp_servers: {
    context7: {
      type: "http",
      url: "https://mcp.context7.com/mcp",
    },
    github: {
      type: "http",
      url: "https://api.githubcopilot.com/mcp/",
      headers: {
        Authorization: "Bearer ${GITHUB_TOKEN}",
      },
    },
    "mem0-mcp": {
      type: "http",
      url: "https://mcp.mem0.ai/mcp",
    },
  },
  metadata: {
    "managed-by": "chant",
  },
});
