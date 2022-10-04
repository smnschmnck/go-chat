import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useState } from 'react';
import IUser from '../interfaces/IUser';
import { InputWithButton } from './atomic/InputWithButton';
import { ISingleMessage } from './MainChat';
import Image from 'next/image';
import Paperclip from '../assets/images/paperclip.svg';
import styles from '../styles/SendMessageForm.module.css';
import { FilePicker } from './atomic/FilePicker';
import { FilePreview } from './FilePreview';

interface SendMessageFormProps {
  chatID: string;
}

interface INewMessage {
  chatID: string;
  textContent: string;
  //TODO extend to be able to send media
  messageType: string;
  mediaUrl: string;
}

export const SendMessageForm: React.FC<SendMessageFormProps> = ({ chatID }) => {
  const queryClient = useQueryClient();
  const userQuery = useQuery<IUser>(['user'], async () => {
    const res = await fetch('/api/user');
    return (await res.json()) as IUser;
  });
  const user = userQuery.data;
  const [messageInputValue, setMessageInputValue] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState('');
  const MAX_MESSAGE_LENGTH = 4096;

  const createMessagePreview = (newMessage: INewMessage) => {
    const timeStamp = Math.round(new Date().getTime() / 1000);
    const message: ISingleMessage = {
      messageID: 'preview',
      senderID: user?.uuid ?? '',
      senderUsername: user?.username ?? '',
      textContent: newMessage.textContent,
      messageType: newMessage.messageType,
      medieUrl: newMessage.mediaUrl,
      timestamp: timeStamp,
      deliveryStatus: 'pending',
    };
    return message;
  };

  const sendRequest = useMutation(
    ['messages', chatID],
    async (newMessage: INewMessage) => {
      if (newMessage.textContent.length > MAX_MESSAGE_LENGTH) {
        setError('Your message is too long');
      }
      const res = await fetch('/api/sendMessage', {
        method: 'post',
        body: JSON.stringify(newMessage),
      });
      if (!res.ok) {
        setError('FAILED TO SEND MESSAGE');
      }
      const json: ISingleMessage[] = await res.json();
      return json;
    },
    {
      onMutate: async (newMessage) => {
        setMessageInputValue('');
        await queryClient.cancelQueries(['messages', chatID]);
        const previousMessages = queryClient.getQueryData<ISingleMessage[]>([
          'messages',
          chatID,
        ]);
        const preview = createMessagePreview(newMessage);
        queryClient.setQueryData<ISingleMessage[]>(
          ['messages', chatID],
          (oldMessages) => [...(oldMessages ?? []), preview]
        );
        return { previousMessages };
      },
      onError: (err, newMessages, context) => {
        class ctx {
          previousMessages: ISingleMessage[] | undefined;
        }
        if (context instanceof ctx) {
          queryClient.setQueryData(
            ['messages', chatID],
            context?.previousMessages ?? []
          );
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries(['messages', chatID]);
        queryClient.invalidateQueries(['chats']);
      },
    }
  );

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    const body = {
      chatID: chatID,
      textContent: messageInputValue,
      //TODO extend to be able to send media
      messageType: 'plaintext',
      mediaUrl: '',
    };
    sendRequest.mutate(body);
  };

  const setValueWithLengthCheck = (val: string) => {
    if (val.length > MAX_MESSAGE_LENGTH + 1) {
      setError('Your message is too long');
      return;
    } else {
      setError('');
    }
    setMessageInputValue(val);
  };

  const fileChangeHandler = (files: FileList) => {
    const fileArr: File[] = [];
    const n = files.length;
    for (let i = 0; i < n; i++) {
      const f = files.item(i);
      if (f) {
        fileArr.push(f);
      }
    }
    setFiles(fileArr);
  };

  return (
    <div>
      {files.length > 0 && <FilePreview files={files} setFiles={setFiles} />}
      <InputWithButton
        buttonText={'Send'}
        inputPlaceHolder={'Type Message'}
        value={messageInputValue}
        setValue={setValueWithLengthCheck}
        submitHandler={sendMessage}
        buttonDisabled={messageInputValue.length <= 0}
        error={error}
      >
        <FilePicker handleFileChange={fileChangeHandler} multiple>
          <div className={styles.buttonWrapper}>
            <span className={styles.attachmentButton}>
              <Image
                className={styles.symbol}
                src={Paperclip}
                alt="Add attachment"
                layout="fill"
                objectFit="contain"
              />
            </span>
          </div>
        </FilePicker>
      </InputWithButton>
    </div>
  );
};
