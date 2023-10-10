import { TScriptItems } from "@/components/TranscriptionEditor";

export function clearTranscriptionItems(items: any): any[] {
  items.forEach((item: any, key: number) => {
    if (!item.start_time) {
      const prev = items[key - 1];
      prev.alternatives[0].content += item.alternatives[0].content;
      delete items[key];
    }
  });
  return items.map((item: any) => {
    const { start_time, end_time } = item;
    const content = item.alternatives[0].content;
    return { start_time, end_time, content };
  });
}

function secondsToHHMMSSMS(timeString: any) {
  const d = new Date(parseFloat(timeString) * 1000);
  return d.toISOString().slice(11, 23).replace('.', ',');
}


/**
 * Convert the export interface TScriptItems {
  start_time: string;
  end_time: string;
  content: string;
}
 *into srt format which is 
 *1.
 *00:00 -> 00:00
 *"AWS SERVER "
 * @param items 
 * @returns 
 */
export function transcriptionItemsToSrt(items: TScriptItems[]): string {
  let srt = '';
  let i = 1;
  items.filter((item: any) => !!item).forEach((item: any) => {
    // seq
    srt += i + "\n";
    // timestamps
    const { start_time, end_time } = item; // 52.345
    srt += secondsToHHMMSSMS(start_time)
      + ' --> '
      + secondsToHHMMSSMS(end_time)
      + "\n";

    // content
    srt += item.content + "\n";
    srt += "\n";
    i++;
  });
  return srt;
}