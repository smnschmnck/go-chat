import { formatTimestamp } from '../helpers/stringFormatters';
import styles from '../styles/SingleChatMessageComponent.module.css';
import playIcon from '../assets/images/playButton.svg';
import Image from 'next/image';

interface SingleChatMessageProps {
  senderUsername: string;
  timestamp: number;
  textContent: string;
  isPreview: boolean;
  byCurUser: boolean;
  messageType: 'plaintext' | 'image' | 'video' | 'audio' | 'data';
  mediaUrl: string;
  openMediaModal: (mediaType: 'image' | 'video', mediaSource: string) => void;
}

export const SingleChatMessage: React.FC<SingleChatMessageProps> = ({
  timestamp,
  textContent,
  isPreview,
  senderUsername,
  byCurUser,
  messageType,
  mediaUrl,
  openMediaModal,
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
          styles.contentWrapper +
          ' ' +
          (byCurUser ? styles.userContent : styles.participantContent)
        }
      >
        {messageType === 'image' && (
          <div className={styles.imageWrapper}>
            <button
              className={styles.playButton}
              onClick={() => openMediaModal('image', mediaUrl)}
            >
              <span className={styles.playImageWrapper}>
                <Image src={playIcon} alt="Play" layout="fill"></Image>
              </span>
            </button>
            <Image src={mediaUrl} alt="image" layout="fill" objectFit="cover" />
          </div>
        )}
        {messageType === 'video' && (
          <div className={styles.videoWrapper}>
            <button
              className={styles.playButton}
              onClick={() => openMediaModal('video', mediaUrl)}
            >
              <span className={styles.playImageWrapper}>
                <Image src={playIcon} alt="Play" layout="fill"></Image>
              </span>
            </button>
            <video
              className={styles.videoPlayer}
              src={mediaUrl + '#t=0.001'}
              playsInline
            />
          </div>
        )}
        {messageType === 'audio' && (
          <audio src={mediaUrl} className={styles.audioPlayer} controls></audio>
        )}
        {textContent && (
          <p
            className={styles.textContent}
            id={isPreview ? styles.preview : ''}
          >
            {textContent}
          </p>
        )}
      </div>
      <p className={styles.timestamp}>{formatTimestamp(timestamp)}</p>
    </div>
  );
};
