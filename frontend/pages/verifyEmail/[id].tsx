import { GetServerSideProps, GetServerSidePropsContext, NextPage } from 'next';
import Head from 'next/head';
import { BigLink } from '../../components/atomic/Link';
import DefaultLayout from '../../components/DefaultLayout';
import { BACKEND_HOST } from '../../helpers/serverGlobals';
import styles from '../../styles/VerifiyEmailPage.module.css';

interface EmailVerificationPageProps {
  verificationSuccess: boolean;
  status: number;
}

export const getServerSideProps: GetServerSideProps<
  EmailVerificationPageProps
> = async (context: GetServerSidePropsContext) => {
  try {
    const { id } = context.query;
    const verificationID = String(id);
    const body = { emailToken: verificationID };
    const response = await fetch(BACKEND_HOST + '/verifyEmail', {
      method: 'post',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });
    return {
      props: {
        verificationSuccess: response.ok,
        status: response.status,
      },
    };
  } catch {
    return {
      props: {
        verificationSuccess: false,
        status: 503,
      },
    };
  }
};

const EmailVerificationPage: NextPage<EmailVerificationPageProps> = ({
  verificationSuccess,
  status,
}) => {
  return (
    <>
      <Head>
        <title>E-Mail Verification</title>
      </Head>
      <DefaultLayout>
        <div className={styles.content}>
          <div className={styles.main}>
            {verificationSuccess && (
              <>
                <h1>E-Mail verified successfully 🥳</h1>
                <BigLink href="/">Start using emyht</BigLink>
              </>
            )}
            {!verificationSuccess && (
              <>
                {status === 404 && (
                  <>
                    <h1>Could not Verify E-Mail 😟</h1>
                    <h2>
                      Either the supplied link does not work or the E-Mail was
                      verified already
                    </h2>
                  </>
                )}
                {status === 503 && (
                  <>
                    <h1>Error ⚠️</h1>
                    <h2>Please check back later</h2>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </DefaultLayout>
    </>
  );
};

export default EmailVerificationPage;
