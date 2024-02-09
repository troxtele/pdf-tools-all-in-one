import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import {
  Infinity as InfinityIcon,
  LightningChargeFill,
  GearFill,
  HeartFill,
  AwardFill,
  ShieldFillCheck,
} from "react-bootstrap-icons";
import { useTranslation } from "next-i18next";
import Selecto from "react-selecto";
import { isMobile } from "react-device-detect";
import PagePreviwerModal from "../components/PagePreviwerModal";
import {
  handleMerge,
  handlePDFOperationsFileSelection,
} from "../helpers/utils.js";
import Steps from "../components/Steps";
import styles from "../styles/UploadContainer.module.css";
import DocumentPreviewSelectable from "../components/DocumentPreviewSelectable";
import Features from "../components/Features";
import Share from "../components/Share";
import EditFilesFormStep from "../components/EditFilesFormStep";
import UploadAreaFormStep from "../components/UploadAreaFormStep";
import AvailableTools from "../components/AvailableTools";
import usePages from "../hooks/usePages";
import useToolsData from "../hooks/useToolsData";
import pageStyles from "../styles/Page.module.css";
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "rotate-pdf-pages"])),
    },
  };
}

const RotatePDFPage = () => {
  const { RotatePDFTool } = useToolsData();
  const [isSpinnerActive, setIsSpinnerActive] = useState(false);
  const mountedRef = useRef(false);
  //loadedfilesCount is used to count the files currently being loaded to show progress spinner while loading the files //
  const [loadedfilesCount, setLoadedFilesCount] = useState(0);

  const [scrollOptions, setScrollOptions] = useState({});

  const [zoomedPage, setZoomedPage] = useState(null);
  const { t } = useTranslation();
  const {
    pages,
    handleAddPage,
    handleRotatePageRight,
    handleRotatePageLeft,
    handleRotateSelectedPagesToRight,
    rotateSelectedPagesToLeft,
    handleDeleteSelectedPages,
    handleRemovePageSelection,
    handleClearPageSelection,
    handlePageSelection,
    handlePagesSelection,
    handleDeletePage,
  } = usePages();

  const handleChange = (event) => {
    //Calling handlePDFOperationsFileSelection function to extract pdf pages and their data and insert them in an array
    handlePDFOperationsFileSelection(
      event,
      setLoadedFilesCount,
      handleAddPage,
      t,
      mountedRef,
      RotatePDFTool
    );
    //To empty input value; to input same file many time in a row
    event.target.value = null;
  };

  useEffect(() => {
    if (zoomedPage) {
      //clear page selection
      handleClearPageSelection();

      // get zoomed Page index
      const zoomedPageIndex = pages.findIndex(
        (page) => page.id === zoomedPage.id
      );
      // set zoomed page as selected
      handlePageSelection(zoomedPageIndex);
    }
  }, [zoomedPage]);

  useEffect(() => {
    //set mountedRef to true
    mountedRef.current = true;

    setScrollOptions({
      container: document.body,
      getScrollPosition: () => [
        document.body.scrollLeft,
        document.body.scrollTop,
      ],
      throttleTime: 0,
      threshold: 0,
    });

    //cleanup function
    return () => {
      //set mounedRef to false
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    // if loadedfilesCount (count of file currently being loaded) is greater than zero than show spinner
    if (loadedfilesCount > 0) {
      //show spinner
      if (mountedRef.current) {
        setIsSpinnerActive(true);
      }
    } else {
      //after all files are loaded, hide spinner
      if (mountedRef.current) {
        setIsSpinnerActive(false);
      }
    }
  }, [loadedfilesCount]);

  const pagesComponentsArray = (
    <div
      className={`previewer_content ${styles.previewer_content} d-flex flex-wrap ${styles.previewer_content_scrollable} mb-0 mt-0`}
    >
      {!isMobile && (
        <Selecto
          dragContainer={".previewer_content"}
          selectableTargets={[".preview"]}
          selectByClick={false}
          selectFromInside={false}
          toggleContinueSelect={["ctrl"]}
          boundContainer={false}
          hitRate={0}
          ratio={0}
          onSelectStart={(e) => {
            if (
              pages.filter((page) => page.selected === true).length > 0 &&
              !e.inputEvent.ctrlKey
            ) {
              handleClearPageSelection();
            }
          }}
          onSelect={(e) => {
            e.added.forEach((el) => {
              const index = parseInt(el.getAttribute("data-index"));
              handlePageSelection(index);
            });
            e.removed.forEach((el) => {
              const removedIndex = parseInt(el.getAttribute("data-index"));
              if (e.selected.length === 0) {
                handleClearPageSelection();
              } else {
                handleRemovePageSelection(removedIndex);
              }
            });
          }}
          scrollOptions={scrollOptions}
          onScroll={(e) => {
            document.body.scrollBy(e.direction[0] * 10, e.direction[1] * 10);
          }}
        />
      )}

      {pages.map((page, i) => {
        return (
          <DocumentPreviewSelectable
            key={"page-" + page.id}
            page={page}
            index={i}
            onSelectionChange={handlePagesSelection}
            zoomOnPage={(e) => {
              // Stop event bubbling after click event handler executes, to prevent parent click event from unselecting/selecting page
              e.stopPropagation();
              setZoomedPage(page);
            }}
            //
            handleRotatePageRight={(e) => {
              // Stop event bubbling after click event handler executes, to prevent parent click event from unselecting/selecting page
              e.stopPropagation();
              handleRotatePageRight(page.id);
            }}
            handleRotatePageLeft={(e) => {
              // Stop event bubbling after click event handler executes, to prevent parent click event from unselecting/selecting page
              e.stopPropagation();
              handleRotatePageLeft(page.id);
            }}
            handleDeletePage={() => handleDeletePage(page.id)}
          />
        );
      })}
    </div>
  );
  return (
    <>
      <Head>
        {/* Anything you add here will be added to this page only */}
        <title>Rotate PDF | Best PDF Rotator Online</title>
        <meta
          name="description"
          content="Use our online tool to rotate pages in your PDF document. Rotate all or specific pages in a few clicks."
        />
        <meta
          name="Keywords"
          content="rotate pdf pages online, rotate specific pages in pdf, pdf page orientation, online pdf page rotator, rotate pdf files online, pdf document rotator"
        />
        <link
          rel="canonical"
          href={`https://www.example.com${RotatePDFTool.href}`}
          key="canonical"
        />
        {/* You can add your alternate links here, example: */}
        <link
          rel="alternate"
          href={`https://www.example.com/en${RotatePDFTool.href}`}
          hrefLang="en"
        />
        <link
          rel="alternate"
          href={`https://www.example.com/es${RotatePDFTool.href}`}
          hrefLang="es"
        />
        <link
          rel="alternate"
          href={`https://www.example.com/ar${RotatePDFTool.href}`}
          hrefLang="ar"
        />
        <link
          rel="alternate"
          href={`https://www.example.com/zh${RotatePDFTool.href}`}
          hrefLang="zh"
        />{" "}
        <link
          rel="alternate"
          href={`https://www.example.com/de${RotatePDFTool.href}`}
          hrefLang="de"
        />
        <link
          rel="alternate"
          href={`https://www.example.com/fr${RotatePDFTool.href}`}
          hrefLang="fr"
        />
        <link
          rel="alternate"
          href={`https://www.example.com/it${RotatePDFTool.href}`}
          hrefLang="it"
        />
        <link
          rel="alternate"
          href={`https://www.example.com/pt${RotatePDFTool.href}`}
          hrefLang="pt"
        />
        <link
          rel="alternate"
          href={`https://www.example.com/ru${RotatePDFTool.href}`}
          hrefLang="ru"
        />
        <link
          rel="alternate"
          href={`https://www.example.com/uk${RotatePDFTool.href}`}
          hrefLang="uk"
        />
        <link
          rel="alternate"
          href={`https://www.example.com/id${RotatePDFTool.href}`}
          hrefLang="id"
        />
        <link
          rel="alternate"
          href={`https://www.example.com/da${RotatePDFTool.href}`}
          hrefLang="da"
        />
        <link
          rel="alternate"
          href={`https://www.example.com/nl${RotatePDFTool.href}`}
          hrefLang="nl"
        />
        <link
          rel="alternate"
          href={`https://www.example.com/hi${RotatePDFTool.href}`}
          hrefLang="hi"
        />
        <link
          rel="alternate"
          href={`https://www.example.com/ko${RotatePDFTool.href}`}
          hrefLang="ko"
        />
        <link
          rel="alternate"
          href={`https://www.example.com/ja${RotatePDFTool.href}`}
          hrefLang="ja"
        />
      </Head>

      <main>
        <header className="page_section header mb-0">
          <h1 className="title">{t("rotate-pdf-pages:page_header_title")}</h1>
          <p className="description">
            {t("rotate-pdf-pages:page_header_text")}
          </p>
        </header>
        <section className="page_section mt-0">
          <article className="container ">
            <section className={pageStyles.tool_container_wrapper}>
              {/* Container start */}

              {pages.length <= 0 ? (
                <UploadAreaFormStep
                  handleChange={handleChange}
                  isSpinnerActive={isSpinnerActive}
                  isMultipleInput={true}
                  acceptedMimeType={RotatePDFTool.acceptedInputMimeType}
                />
              ) : (
                <EditFilesFormStep
                  acceptedMimeType={RotatePDFTool.acceptedInputMimeType}
                  files={pages}
                  enableAddingMoreFiles={true}
                  filesComponents={pagesComponentsArray}
                  handleChange={handleChange}
                  isSpinnerActive={isSpinnerActive}
                  isMultipleInput={true}
                  isFilesSelectionActive={true}
                  isPanelTopSticky={true}
                  isPanelBottomSticky={true}
                  positionPanelBottomItems={styles.spaced}
                  deleteFiles={handleDeleteSelectedPages}
                  rotateFilesToLeft={rotateSelectedPagesToLeft}
                  rotateFilesToRight={handleRotateSelectedPagesToRight}
                  action={() =>
                    handleMerge(pages, RotatePDFTool.newFileNameSuffix)
                  }
                  actionTitle={t("common:save_&_download")}
                />
              )}

              {/* Page Viwer Modal Start */}
              {zoomedPage !== null ? (
                <PagePreviwerModal
                  pages={pages}
                  currentPage={zoomedPage}
                  setZoomedPage={setZoomedPage}
                  deletePage={handleDeletePage}
                  handleRotatePageRight={handleRotatePageRight}
                  handleRotatePageLeft={handleRotatePageLeft}
                />
              ) : null}
              {/* Page Viwer Modal Start */}

              {/* Conatiner end */}
            </section>
          </article>
        </section>
        {/* steps Start */}
        <Steps
          title={t("rotate-pdf-pages:how_to_title")}
          stepsArray={[
            {
              number: 1,
              description: t("rotate-pdf-pages:how_to_step_one"),
            },
            {
              number: 2,
              description: t("rotate-pdf-pages:how_to_step_two"),
            },
            {
              number: 3,
              description: t("rotate-pdf-pages:how_to_step_three"),
            },
            {
              number: 4,
              description: t("rotate-pdf-pages:how_to_step_four"),
            },
            {
              number: 5,
              description: t("rotate-pdf-pages:how_to_step_five"),
            },
            {
              number: 6,
              description: t("rotate-pdf-pages:how_to_step_six"),
            },
          ]}
        />
        {/* steps end */}
        {/* features start */}
        <Features
          title={t("common:features_title")}
          featuresArray={[
            {
              title: t("rotate-pdf-pages:feature_one_title"),
              description: t("rotate-pdf-pages:feature_one_text"),
              icon: <LightningChargeFill />,
            },
            {
              title: t("rotate-pdf-pages:feature_two_title"),
              description: t("rotate-pdf-pages:feature_two_text"),
              icon: <InfinityIcon />,
            },
            {
              title: t("rotate-pdf-pages:feature_three_title"),
              description: t("rotate-pdf-pages:feature_three_text"),
              icon: <GearFill />,
            },
            {
              title: t("rotate-pdf-pages:feature_four_title"),
              description: t("rotate-pdf-pages:feature_four_text"),
              icon: <ShieldFillCheck />,
            },
            {
              title: t("rotate-pdf-pages:feature_five_title"),
              description: t("rotate-pdf-pages:feature_five_text"),
              icon: <HeartFill />,
            },

            {
              title: t("rotate-pdf-pages:feature_six_title"),
              description: t("rotate-pdf-pages:feature_six_text"),
              icon: <AwardFill />,
            },
          ]}
        />
        {/* features end */}
        {/* Article Start */}
        <section className="page_section">
          <article className={`container ${pageStyles.article_section}`}>
            <header className={pageStyles.article_header}>
              <h2 className={pageStyles.title_section}>
                {t("Discover the Power of SkyForms")}
              </h2>
              <div
                className={`${pageStyles.divider} ${pageStyles.mx_auto}`}
              ></div>
            </header>

            <section className={pageStyles.article_content}>
              <p>{t("Welcome to SkyForms, your all-in-one PDF conversion solution! At SkyForms, we understand the importance of seamless document management, and that's why we've crafted a comprehensive suite of PDF tools. Whether you're looking to convert documents, images, or spreadsheets to the universally compatible PDF format, SkyForms has you covered. Our user-friendly platform is designed to make the conversion process quick and effortless, allowing you to focus on what matters most—your content.")}</p>
              <p>{t("SkyForms stands out with its unparalleled versatility in document conversion. With support for a wide range of file formats, including Word documents, Excel spreadsheets, PowerPoint presentations, images, and more, we empower you to transform your content effortlessly into professional-looking PDFs. Our advanced conversion algorithms ensure that the integrity of your files is maintained throughout the process, delivering high-quality results every time. Say goodbye to format compatibility issues and embrace the simplicity of SkyForms for all your document conversion needs.")}</p>
              <p>{t("At SkyForms, we prioritize the user experience, making our platform intuitive and easy to navigate. Whether you're a seasoned professional or a first-time user, our streamlined interface ensures a hassle-free experience. With just a few clicks, you can convert your files to PDF and access a range of additional features to enhance your documents. SkyForms is your go-to solution for efficient, reliable, and secure PDF conversions, simplifying the way you handle documents in today's digital age. Experience the convenience of SkyForms and elevate your document management to new heights.")}</p>
            </section>
          </article>
        </section>
        {/* Article End */}
        <AvailableTools />
        <Share />
      </main>
    </>
  );
};
export default RotatePDFPage;
