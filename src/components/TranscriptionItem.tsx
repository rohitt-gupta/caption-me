import React from 'react';

interface TranscriptionItemProps {
  item: {
    start_time: string;
    end_time: string;
    content: string;
  };
  handleStartTimeChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleEndTimeChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleContentChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const TranscriptionItem: React.FC<TranscriptionItemProps> = ({
  item,
  handleStartTimeChange,
  handleEndTimeChange,
  handleContentChange,
}) => {
  if (!item) {
    return null;
  }

  return (
    <div className="my-1 grid grid-cols-3 gap-1 items-center">
      <input
        type="text"
        className="bg-white/20 p-1 rounded-md"
        value={item.start_time}
        onChange={handleStartTimeChange}
      />
      <input
        type="text"
        className="bg-white/20 p-1 rounded-md"
        value={item.end_time}
        onChange={handleEndTimeChange}
      />
      <input
        type="text"
        className="bg-white/20 p-1 rounded-md"
        value={item.content}
        onChange={handleContentChange}
      />
    </div>
  );
};

export default TranscriptionItem;