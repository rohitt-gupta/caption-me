import { transcriptionItemsToSrt } from '../awsTranscriptionHelpers';

describe('transcriptionItemsToSrt', () => {
  it('converts items to SRT', () => {
    const items = [
      { start_time: '0.000', end_time: '1.500', content: 'Hello' },
      { start_time: '1.500', end_time: '3.000', content: 'world' },
    ];

    const expected =
      '1\n' +
      '00:00:00,000 --> 00:00:01,500\n' +
      'Hello\n\n' +
      '2\n' +
      '00:00:01,500 --> 00:00:03,000\n' +
      'world\n\n';

    expect(transcriptionItemsToSrt(items as any)).toBe(expected);
  });
});
