import { formatTimestamp } from '../helpers/stringFormatters';
import styles from '../styles/SingleChatMessageComponent.module.css';
import Image from 'next/image';

interface SingleChatMessageProps {
  senderUsername: string;
  timestamp: number;
  textContent: string;
  isPreview: boolean;
  byCurUser: boolean;
  messageType: 'plaintext' | 'image' | 'video' | 'audio' | 'data';
  mediaUrl: string;
}

export const SingleChatMessage: React.FC<SingleChatMessageProps> = ({
  timestamp,
  textContent,
  isPreview,
  senderUsername,
  byCurUser,
  messageType,
  mediaUrl,
}) => {
  return (
    <div
      className={
        byCurUser ? styles.ownMessageWrapper : styles.participantMessageWrapper
      }
    >
      {!byCurUser && (
        <div className={styles.participantMessageInfo}>
          <p className={styles.username}>{senderUsername}</p>
          <p className={styles.timestamp}>{formatTimestamp(timestamp)}</p>
        </div>
      )}
      <div
        className={
          byCurUser
            ? styles.ownTextContentWrapper
            : styles.participantTextContentWrapper
        }
      >
        {messageType === 'image' && (
          <div className={styles.imageWrapper}>
            <Image src={mediaUrl} alt="image" layout="fill" objectFit="cover" />
          </div>
        )}
        <p className={styles.textContent} id={isPreview ? styles.preview : ''}>
          {textContent}
        </p>
      </div>
      <p className={styles.timestamp}>{formatTimestamp(timestamp)}</p>
    </div>
  );
};
