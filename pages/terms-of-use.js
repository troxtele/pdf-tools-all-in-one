import React from "react";
import Head from "next/head";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import pageStyles from "../styles/Page.module.css";
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "terms"])),
    },
  };
}

const TermsOfUse = () => {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        {/* Anything you add here will be added to this page only */}
        <title>Terms Of Use</title>
        <meta name="description" content="" />
        <meta name="Keywords" content="" />
        <meta name="robots" content="noindex,nofollow" />
        {/* Anything you add here will be added this page only */}
        {/* You can add your canonical here */}
        {/* You can add your alternate here */}
      </Head>

      <main>
        <header className="page_section header mb-0">
          <h1 className="title">{t("common:terms")}</h1>
        </header>
        <section className="page_section mt-0">
          <article className="container">
            <section>
              <div className={`${pageStyles.paragraph_text}`}>
                <h3>{t("Acceptance of Terms:")}</h3>
                <p>{t("By accessing and using the SkyformsPDF website and its services, you agree to comply with and be bound by these Terms and Conditions. If you do not agree with any part of these terms, you may not access the website or use its services.")}</p>
                <h3>{t("Use of Services:")}</h3>
                <p>{t("SkyformsPDF provides a platform for users to access and utilize a variety of PDF tools. Users are responsible for their use of the services and must adhere to all applicable laws and regulations. Any misuse, unauthorized access, or violation of these terms may result in the termination of your access to the services.")}</p>
                <h3>{t("Intellectual Property Rights:")}</h3>
                <p>{t("The content, features, and functionality of SkyformsPDF, including but not limited to text, graphics, logos, images, and software, are the property of Operandi Philosophy and are protected by copyright and other intellectual property laws. Users may not reproduce, distribute, modify, or create derivative works from any part of the website without express written consent.")}</p>
                <h3>{t("Privacy and Security:")}</h3>
                <p>{t("We take the privacy and security of user information seriously. Our Privacy Policy outlines how we collect, use, and protect your personal data. By using SkyformsPDF, you consent to the practices described in the Privacy Policy. It is your responsibility to review and understand our privacy practices.")}</p>
              </div>
            </section>
          </article>
        </section>
      </main>
    </>
  );
};

export default TermsOfUse;
