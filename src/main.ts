import { ServerOptions, cli, defineAgent, voice } from '@livekit/agents';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { createAgent } from './agent.ts';

// Load environment variables from a local file.
// Make sure to set LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET
// when running locally or self-hosting your agent server.
dotenv.config({ path: '.env.local' });

export default defineAgent({
  entry: async (ctx) => {
    // OpenAI Realtime handles speech input, turn detection and speech output.
    const session = new voice.AgentSession();

    await session.start({
      agent: createAgent(),
      room: ctx.room,
    });

    // Join the room and connect to the user
    await ctx.connect();

    // Speak first: greet the user before they say anything
    session.generateReply({
      instructions: 'Enthusiastically greet the user and offer to help.',
    });
  },
});

// Run the agent server
cli.runApp(
  new ServerOptions({
    agent: fileURLToPath(import.meta.url),
    agentName: 'my-agent',
  }),
);
