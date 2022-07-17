import { ChatInfoHeader } from './ChatInfoHeader';
import fallBackPP from '../assets/images/fallback-pp.webp';
import styles from '../styles/ContactRequestDialogComponent.module.css';
import { BigButton, BigButtonGreyHover, SmallButton } from './atomic/Button';

interface ContactRequestResolverProps {
  senderID: string;
  senderProfilePicture: string;
  senderUsername: string;
  closeChat: () => void;
}

export const ContactRequestResolver: React.FC<ContactRequestResolverProps> = ({
  senderID,
  senderProfilePicture,
  senderUsername,
  closeChat,
}) => {
  return (
    <div className={styles.container}>
      <ChatInfoHeader
        profilePictureUrl={fallBackPP.src}
        chatID={senderID}
        chatName={senderUsername}
        closeChat={closeChat}
      />
      <div className={styles.main}>
        <div className={styles.dialogContainer}>
          <h1 className={styles.heading}>Contact Request 👋</h1>
          <h2 className={styles.info}>
            Allow {senderUsername} to contact you?
          </h2>
          <div className={styles.buttonContainer}>
            <BigButton>Allow</BigButton>
            <BigButtonGreyHover color="red">Decline</BigButtonGreyHover>
          </div>
          <hr className={styles.dividerHr} />
          <div className={styles.blockContainer}>
            <SmallButton color="red">Block</SmallButton>
            <p className={styles.blockInfo}>
              This prevents {senderUsername} from ever sending you a contact
              request again
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
