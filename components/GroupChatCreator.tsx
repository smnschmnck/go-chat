import { useState } from 'react';
import { BigButton, SmallButton } from './atomic/Button';
import { ContactList } from './ContactList';
import styles from '../styles/AddChatModal.module.css';
import ISingleChat from '../interfaces/ISingleChat';
import { Contact } from './SingleContact';

interface GroupChatCreaterProps {
  contacts: Contact[];
  closeHandler: () => void;
  setChats: (chats: ISingleChat[]) => void;
  setSuccess: (success: boolean) => void;
  isLoading: boolean;
}

export const GroupChatCreator: React.FC<GroupChatCreaterProps> = ({
  closeHandler,
  setChats,
  setSuccess,
  contacts,
  isLoading,
}) => {
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  const createGroupChat = async () => {
    const body = {
      chatName: 'blaa',
      chatPicture: '',
      participantUUIDs: selectedContacts,
    };

    const res = await fetch('/api/startGroupChat', {
      method: 'post',
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      setErrorMessage(await res.text());
      resetSelectedContacts();
      return;
    }

    const json: ISingleChat[] = await res.json();
    setChats(json);
    setSuccess(true);
  };

  const resetSelectedContacts = () => {
    setSelectedContacts([]);
  };

  const setSelectedContactsWrapper = (selectedContactsList: string[]) => {
    setSelectedContacts(selectedContactsList);
    setErrorMessage('');
  };
  return (
    <>
      <ContactList
        isLoading={isLoading}
        selectedContacts={selectedContacts}
        setSelectedContacts={setSelectedContactsWrapper}
        contacts={contacts}
        multiselect={true}
      />
      <div className={styles.buttons}>
        <BigButton
          onClick={() => createGroupChat()}
          disabled={selectedContacts.length <= 0}
        >
          Create groupchat
        </BigButton>
        {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
        <SmallButton onClick={closeHandler}>Cancel</SmallButton>
      </div>
    </>
  );
};
