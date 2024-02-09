import React from "react";
import Head from "next/head";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import pageStyles from "../styles/Page.module.css";

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "privacy"])),
    },
  };
}

const PrivacyPolicy = () => {
  const { t } = useTranslation();
  return (
    <>
      <Head>
        {/* Anything you add here will be added to this page only */}
        <title>Privacy Policy</title>
        <meta name="description" content="" />
        <meta name="Keywords" content="" />
        <meta name="robots" content="noindex,nofollow" />
        {/* Anything you add here will be added this page only */}
        {/* You can add your canonical here */}
        {/* You can add your alternate here */}
      </Head>

      <main>
        <header className="page_section header mb-0">
          <h1 className="title">{t("common:privacy")}</h1>
        </header>
        <section className="page_section mt-0">
          <article className="container">
            <section>
              <div className={pageStyles.paragraph_text}>
                <h3>{t("Privacy Policy for Skyforms")}</h3>
                <p>{t("Welcome to Skyforms! This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you use our services.")}</p>
                <h3>{t("Information We Collect")}</h3>
                <p>{t("We may collect personal information that you provide directly to us when you use our services, such as when you create an account, fill out forms, or communicate with us.")}</p>
                <h3>{t("Data Security")}</h3>
                <p>{t("We prioritize the security of your personal information. However, please be aware that no method of transmission over the internet or electronic storage is 100% secure. We strive to use commercially acceptable means to protect your information, but we cannot guarantee its absolute security.")}</p>
                <h3>{t("Sharing Your Information")}</h3>
                <p>{t("We do not sell, trade, or rent your personal information to third parties. We may share your information with trusted third-party service providers for the purposes of providing our services.")}</p>              
                <h3>{t("Your Choices")}</h3>
                <ul>
                  <li>{t("Review and update your personal information")}</li>
                  <li>{t("Opt-out of receiving promotional communications")}</li>
                </ul>
                <h3>{t("Contact Us")}</h3>
                <p>{t("If you have any questions or concerns about our Privacy Policy, please contact us at info@operandiphilosophy.com.")}</p>                  
              </div>
            </section>
          </article>
        </section>
      </main>
    </>
  );
};

export default PrivacyPolicy;
