import { ChatInfoHeader } from './ChatInfoHeader';
import styles from '../styles/ContactRequestDialogComponent.module.css';
import { BigButton, BigButtonGreyHover, SmallButton } from './atomic/Button';
import { useState } from 'react';

interface ContactRequestDialogProps {
  senderID: string;
  senderProfilePicture?: string;
  senderUsername: string;
  closeChat: () => void;
  closeHandler: () => void;
}

export const ContactRequestDialog: React.FC<ContactRequestDialogProps> = ({
  senderID,
  senderUsername,
  closeChat,
  senderProfilePicture,
  closeHandler,
}) => {
  const [successMessage, setSuccessMessage] = useState('');
  const [handledSuccessfully, sethandledSuccessfully] = useState(false);
  const handleContactReq = async (action: string) => {
    const body = {
      senderID: senderID,
      action: action,
    };

    const res = await fetch('/api/handleContactRequest', {
      method: 'post',
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      alert(await res.text());
      return;
    }

    sethandledSuccessfully(true);
    switch (action) {
      case 'accept':
        setSuccessMessage(
          `Succesfully allowed ${senderUsername} to contact you 🥳`
        );
        break;
      case 'decline':
        setSuccessMessage(
          `Succesfully declined ${senderUsername} from contacting you 🙅`
        );
        break;
      case 'block':
        setSuccessMessage(
          `Succesfully blocked ${senderUsername} from contacting you 🚫`
        );
        break;
      default:
        break;
    }
  };

  return (
    <div className={styles.container}>
      <ChatInfoHeader
        name={senderUsername}
        close={closeChat}
        picUrl={senderProfilePicture}
        info="12:21"
        chatType="contactRequest"
      />
      <div className={styles.main}>
        {!handledSuccessfully && (
          <div className={styles.dialogContainer}>
            <h1 className={styles.heading}>Contact Request 👋</h1>
            <h2 className={styles.info}>
              Allow {senderUsername} to contact you?
            </h2>
            <div className={styles.buttonContainer}>
              <BigButton onClick={() => handleContactReq('accept')}>
                Allow
              </BigButton>
              <BigButtonGreyHover
                color="red"
                onClick={() => handleContactReq('decline')}
              >
                Decline
              </BigButtonGreyHover>
            </div>
            <hr className={styles.dividerHr} />
            <div className={styles.blockContainer}>
              <SmallButton
                color="red"
                onClick={() => handleContactReq('block')}
              >
                Block
              </SmallButton>
              <p className={styles.blockInfo}>
                This prevents {senderUsername} from ever sending you a contact
                request again
              </p>
            </div>
          </div>
        )}
        {handledSuccessfully && (
          <div className={styles.successContainer}>
            <h2>{successMessage}</h2>
            <div className={styles.closeButton}>
              <BigButton onClick={closeHandler}>Close</BigButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
