import { AgentSessionEventTypes, log, type voice } from '@livekit/agents';
import { realtime } from '@livekit/agents-plugin-openai';

// Only metadata is retained: never log audio, transcripts, tool arguments or results.
// These are server observation times, not browser playback or useful-answer latency.
export function selectProviderTiming(event: realtime.GPTLive.ServerEvent) {
  if (event.type === 'session.delegation.created') {
    return {
      event: event.type,
      delegationId: event.delegation?.id ?? null,
      target: event.delegation?.target ?? null,
    };
  }
  if (
    event.type === 'response.event' &&
    event.event &&
    ['response.created', 'response.completed', 'response.failed', 'response.incomplete'].includes(
      event.event.type,
    )
  ) {
    return {
      event: event.event.type,
      delegationId: event.delegation_id ?? null,
      responseId: event.event.response?.id ?? null,
      model: event.event.response?.model ?? null,
      reasoningTokens: event.event.response?.usage?.output_tokens_details?.reasoning_tokens ?? null,
    };
  }
  return null;
}

export function observeSessionTiming(session: voice.AgentSession) {
  const logger = log();
  session.on(AgentSessionEventTypes.UserStateChanged, (event) => {
    logger.info(
      { event: event.type, state: event.newState, observedAtMs: Date.now() },
      'voice_timing',
    );
  });
  session.on(AgentSessionEventTypes.AgentStateChanged, (event) => {
    logger.info(
      { event: event.type, state: event.newState, observedAtMs: Date.now() },
      'voice_timing',
    );
  });
}

export function observeProviderTiming(agent: voice.Agent) {
  const session = agent.duplexSession;
  if (!(session instanceof realtime.GPTLiveSession)) {
    throw new Error('GPT-Live timing requires the configured GPT-Live session');
  }
  const logger = log();
  const recordEvent = (event: realtime.GPTLive.ServerEvent) => {
    const timing = selectProviderTiming(event);
    if (timing) {
      logger.info(
        { ...timing, sessionId: session.sessionId, observedAtMs: Date.now() },
        'voice_timing',
      );
    }
  };
  session.on('openai_server_event_received', recordEvent);
  return () => session.off('openai_server_event_received', recordEvent);
}
