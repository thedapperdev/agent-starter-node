import { describe, expect, it } from 'vitest';
import { selectProviderTiming } from './voice-timing.ts';

describe('passive provider timing metadata', () => {
  it('preserves correlation across separate and overlapping delegations', () => {
    for (const id of ['first', 'correction']) {
      expect(
        selectProviderTiming({
          type: 'session.delegation.created',
          delegation: { id, target: 'responses' },
        }),
      ).toEqual({ event: 'session.delegation.created', delegationId: id, target: 'responses' });
      expect(
        selectProviderTiming({
          type: 'response.event',
          delegation_id: id,
          event: { type: 'response.completed', response: { id: `response-${id}` } },
        }),
      ).toMatchObject({ delegationId: id, responseId: `response-${id}` });
    }
  });

  it('does not log high-volume audio, transcripts or backend output', () => {
    expect(
      selectProviderTiming({ type: 'session.output_audio.delta', delta: 'private-audio' }),
    ).toBeNull();
    expect(
      selectProviderTiming({ type: 'session.input_transcript.delta', delta: 'private-input' }),
    ).toBeNull();
    expect(
      selectProviderTiming({ type: 'session.output_transcript.delta', delta: 'private-output' }),
    ).toBeNull();
    expect(
      selectProviderTiming({
        type: 'response.event',
        event: {
          type: 'response.output_item.done',
          item: { arguments: 'private-tool-input' },
        },
      }),
    ).toBeNull();
  });

  it.each(['response.failed', 'response.incomplete'])(
    'retains %s without leaking error content',
    (type) => {
      expect(
        selectProviderTiming({
          type: 'response.event',
          delegation_id: 'task',
          event: {
            type,
            response: {
              id: 'response',
              error: { message: 'private content' },
              usage: { output_tokens_details: { reasoning_tokens: 12 } },
            },
          },
        }),
      ).toEqual({
        event: type,
        delegationId: 'task',
        responseId: 'response',
        model: null,
        reasoningTokens: 12,
      });
    },
  );

  it('leaves missing correlation and usage unknown instead of inventing values', () => {
    expect(
      selectProviderTiming({ type: 'response.event', event: { type: 'response.created' } }),
    ).toEqual({
      event: 'response.created',
      delegationId: null,
      responseId: null,
      model: null,
      reasoningTokens: null,
    });
    expect(selectProviderTiming({ type: 'response.event' })).toBeNull();
  });
});
