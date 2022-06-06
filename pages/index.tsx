import type {
  GetServerSideProps,
  GetServerSidePropsContext,
  NextPage,
} from 'next';
import Head from 'next/head';
import Chats from '../components/Chats';
import { getLoginData } from '../helpers/loginHelpers';
import styles from '../styles/IndexPage.module.css';
import fakeChats from '../dev/dummyData/fakeChats.json';
import Image from 'next/image';
import logo from '../assets/images/logo-small.webp';
import more from '../assets/images/more.svg';

interface UserProps {
  email: string;
  username: string;
  isAdmin: boolean;
}

export const getServerSideProps: GetServerSideProps<UserProps | {}> = async (
  context: GetServerSidePropsContext
) => {
  const cookies = context.req.cookies;
  try {
    const getUserResponse = await getLoginData(cookies);
    if (!getUserResponse.emailActive) {
      const res = context.res;
      res.writeHead(302, { Location: '/noEmail' });
      res.end();
      return {
        props: {},
      };
    }
    return {
      props: {
        email: getUserResponse.email,
        username: getUserResponse.username,
        isAdmin: getUserResponse.isAdmin,
      },
    };
  } catch {
    //Not logged in
    const res = context.res;
    res.writeHead(302, { Location: '/login' });
    res.end();
    return {
      props: {},
    };
  }
};

const HomePage: NextPage<UserProps> = (props) => {
  return (
    <>
      <Head>
        <title>emyht</title>
      </Head>
      <div className={styles.sidebar}>
        <div className={styles.innerSidebar}>
          <div className={styles.logoContainer}>
            <Image src={logo} alt="emyht-logo" />
          </div>
          <Chats chats={fakeChats} />
        </div>
        <div className={styles.settingsContainer}>
          <div className={styles.infoContainer}>
            <h3 className={styles.usernameH3}>{props.username}</h3>
            <p className={styles.emailP}>{props.email}</p>
          </div>
          <button className={styles.settingsButton} title="Settings">
            <Image src={more} alt="settings" />
          </button>
        </div>
      </div>
    </>
  );
};

export default HomePage;
