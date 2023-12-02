import { Chat } from '@/api/chats';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';
import { queryKeys } from '@/configs/queryKeys';
import { useDataChangeDetector } from '@/hooks/api/useDataChangeDetector';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { FC, useState } from 'react';

type SingleChatProps = {
  chat: Chat;
};

const SingleChat: FC<SingleChatProps> = ({ chat }) => (
  <li>
    <Link
      className="flex w-full items-center gap-3 border-b border-b-zinc-100 px-2 py-3 transition hover:bg-zinc-100"
      to="/chat/$chatId"
      params={{ chatId: chat.chatID }}
    >
      <Avatar imgUrl={chat.pictureUrl} />
      <div className="truncate text-sm">
        <p className="font-semibold">{chat.chatName}</p>
        <p className="truncate text-zinc-500">
          {chat.textContent ?? `Send a message to ${chat.chatName}`}
        </p>
      </div>
    </Link>
  </li>
);

export const ChatList: FC = () => {
  const { data: chats } = useQuery(queryKeys.chats.all);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [animationParent, enable] = useAutoAnimate();

  const filteredChats = chats?.filter((chat) => {
    const chatLowerCase = chat.chatName.toLowerCase();
    const queryLowerCase = chatSearchQuery.toLowerCase();

    return chatLowerCase.includes(queryLowerCase);
  });

  const hasChats = !!filteredChats && filteredChats.length > 0;

  useDataChangeDetector({
    data: chats,
    onChange: () => {
      enable(true);
    },
    onNoChange: () => {
      enable(false);
    },
  });

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <Input
        onChange={(e) => setChatSearchQuery(e.target.value)}
        value={chatSearchQuery}
        placeholder="Search chats"
        startAdornment={
          <div className="text-zinc-500">
            <MagnifyingGlassIcon className="h-4 w-4" />
          </div>
        }
      />
      <div className="flex h-full justify-center overflow-y-scroll">
        {!hasChats && (
          <div className="flex flex-col items-center justify-center">
            <p className="text-lg font-medium">No chats</p>
            <Link to="/initiate">Start new chat</Link>
          </div>
        )}
        <ul className="flex h-1 w-full grow flex-col" ref={animationParent}>
          {hasChats &&
            filteredChats.map((c) => <SingleChat key={c.chatID} chat={c} />)}
        </ul>
      </div>
    </div>
  );
};
