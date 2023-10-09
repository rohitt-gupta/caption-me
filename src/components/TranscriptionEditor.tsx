import TranscriptionItem from "@/components/TranscriptionItem";

interface TranscriptionEditorProps {
  awsTranscriptionItems: TScriptItems[];
  setAwsTranscriptionItems: React.Dispatch<React.SetStateAction<TScriptItems[]>>;
}

export interface TScriptItems {
  start_time: string;
  end_time: string;
  content: string;
  [key: string]: string;
}

export default function TranscriptionEditor({
  awsTranscriptionItems,
  setAwsTranscriptionItems,
}: TranscriptionEditorProps) {
  function updateTranscriptionItem(
    index: number,
    prop: keyof TScriptItems,
    ev: React.ChangeEvent<HTMLInputElement>
  ) {
    const newAwsItems = [...awsTranscriptionItems];
    const newItem = { ...newAwsItems[index] };
    newItem[prop] = ev.target.value;
    newAwsItems[index] = newItem;
    setAwsTranscriptionItems(newAwsItems);
  }

  return (
    <>
      <div className="grid grid-cols-3 sticky top-0 bg-violet-800/80 p-2 rounded-md">
        <div>From</div>
        <div>End</div>
        <div>Content</div>
      </div>
      {awsTranscriptionItems.length > 0 && (
        <div className="h-48 sm:h-auto overflow-y-scroll sm:overflow-auto">
          {awsTranscriptionItems.map((item, key) => (
            <div key={key}>
              <TranscriptionItem
                handleStartTimeChange={(ev: React.ChangeEvent<HTMLInputElement>) =>
                  updateTranscriptionItem(key, 'start_time', ev)
                }
                handleEndTimeChange={(ev: React.ChangeEvent<HTMLInputElement>) =>
                  updateTranscriptionItem(key, 'end_time', ev)
                }
                handleContentChange={(ev: React.ChangeEvent<HTMLInputElement>) =>
                  updateTranscriptionItem(key, 'content', ev)
                }
                item={item}
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
}