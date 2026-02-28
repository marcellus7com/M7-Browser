import React from 'react';

export const ChatScreen: React.FC = () => {
  const url = 'https://direct.help/@contactm7';

  return (
    <div className="flex flex-col h-full bg-bg-main overflow-hidden">
      <div className="flex-1 bg-white relative overflow-hidden">
        <iframe 
          src={url} 
          className="w-full h-full border-none"
          title="M7 Suporte"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          style={{ overflow: 'hidden' }}
          scrolling="no"
        />
      </div>
    </div>
  );
};
